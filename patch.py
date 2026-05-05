import os
import re

backend_dir = "../aegis-backend/backend"
engine_dir = "../aegis-engine/engine"

def patch_file(filepath, patch_func):
    with open(filepath, 'r') as f:
        content = f.read()
    new_content = patch_func(content)
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Patched {filepath}")
    else:
        print(f"No changes for {filepath}")

# 1. Update Backend assetService.js
def patch_assetService(c):
    if "const supabase = require('../config/supabase');" not in c:
        print("Warning: assetService.js does not contain supabase require.")
        return c
    
    # In registerAsset, upload fileBuffer to Supabase storage before returning data
    if "return data;" in c and "from('assets')" in c and "registerAsset({" in c:
        # replace the return with the upload logic
        old_insert = """    const { data, error } = await supabase
      .from('assets')
      .insert({
        name,
        type,
        hash_signature,
        owner: 'System',
      })
      .select()
      .single();

    if (error) throw error;

    // Step 3: Return the created asset
    return data;"""
        new_insert = """    const { data, error } = await supabase
      .from('assets')
      .insert({
        name,
        type,
        hash_signature,
        owner: 'System',
      })
      .select()
      .single();

    if (error) throw error;

    // Step 2.5: Upload file to Supabase storage bucket "assets"
    const { error: storageError } = await supabase.storage
      .from('assets')
      .upload(`${data.id}.jpg`, fileBuffer, {
        contentType: fileBuffer.mimetype || 'image/jpeg',
        upsert: true
      });

    if (storageError) {
      console.error('Failed to upload image to storage:', storageError);
    }

    // Step 3: Return the created asset
    return data;"""
        c = c.replace(old_insert, new_insert)
    return c

patch_file(os.path.join(backend_dir, "services/assetService.js"), patch_assetService)

# 2. Update Backend ai.service.js
def patch_aiService(c):
    old = """  const assetsPayload = registeredAssets.map((a) => ({
    id: a.id,
    hash_signature: a.hash_signature,
  }));"""
    new = """  const supabase = require('../config/supabase');
  const assetsPayload = registeredAssets.map((a) => {
    const { data: publicUrlData } = supabase.storage.from('assets').getPublicUrl(`${a.id}.jpg`);
    return {
      id: a.id,
      hash_signature: a.hash_signature,
      image_url: publicUrlData.publicUrl
    };
  });"""
    return c.replace(old, new)

patch_file(os.path.join(backend_dir, "utils/ai.service.js"), patch_aiService)

# 3. Update Backend assetRoutes.js
def patch_assetRoutes(c):
    if "router.get('/:id/image'" in c:
        return c
    
    new_route = """
const supabase = require('../config/supabase');
router.get('/:id/image', (req, res) => {
  const { data } = supabase.storage.from('assets').getPublicUrl(`${req.params.id}.jpg`);
  res.redirect(data.publicUrl);
});
"""
    c = c.replace("router.get('/:id', assetController.getById);", "router.get('/:id', assetController.getById);" + new_route)
    return c

patch_file(os.path.join(backend_dir, "routes/assetRoutes.js"), patch_assetRoutes)

# 4. Update Engine endpoints.py
def patch_endpoints(c):
    old = """                "asset": {
                    "asset_id": asset.get("id"),
                    "phash": hs.get("phash"),
                    "dhash": hs.get("dhash"),
                    "ahash": hs.get("ahash"),
                    "chash": hs.get("chash"),
                    "width": hs.get("width"),
                    "height": hs.get("height"),
                    "blur_index": hs.get("blur_index"),
                },"""
    new = """                "asset": {
                    "asset_id": asset.get("id"),
                    "image_url": asset.get("image_url"),
                    "phash": hs.get("phash"),
                    "dhash": hs.get("dhash"),
                    "ahash": hs.get("ahash"),
                    "chash": hs.get("chash"),
                    "width": hs.get("width"),
                    "height": hs.get("height"),
                    "blur_index": hs.get("blur_index"),
                },"""
    return c.replace(old, new)

patch_file(os.path.join(engine_dir, "api/endpoints.py"), patch_endpoints)

# 5. Update Engine ai_engine.py
def patch_ai_engine(c):
    if "import requests" not in c:
        c = "import requests\nimport tempfile\n" + c

    old_img_open = """                    img = Image.open(asset["file_path"])
                    contents.append(f"Asset ID: {asset['asset_id']}")
                    contents.append(img)
                except Exception:
                    pass"""
    new_img_open = """                    if "image_url" in asset and asset["image_url"]:
                        res = requests.get(asset["image_url"])
                        if res.status_code == 200:
                            tf = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
                            tf.write(res.content)
                            tf.close()
                            img = Image.open(tf.name)
                            contents.append(f"Asset ID: {asset['asset_id']}")
                            contents.append(img)
                except Exception as ex:
                    print(f"Error loading image from URL: {ex}")
                    pass"""
    return c.replace(old_img_open, new_img_open)

patch_file(os.path.join(engine_dir, "core/ai_engine.py"), patch_ai_engine)

print("Patching complete.")
