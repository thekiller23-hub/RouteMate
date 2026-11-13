import os
import shutil
import re
from PIL import Image

def natural_key(filename):
    # Extracts all numbers for true natural sorting
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', filename)]

def process_folder(src_folder, dest_folder, prefix="frame_"):
    os.makedirs(dest_folder, exist_ok=True)
    files = [f for f in os.listdir(src_folder) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    files.sort(key=natural_key)
    
    print(f"Processing '{src_folder}': found {len(files)} frames.")
    frame_list = []
    
    for idx, f in enumerate(files):
        src_path = os.path.join(src_folder, f)
        
        # Save original copy with standardized sequence name
        ext = os.path.splitext(f)[1].lower()
        std_name = f"{prefix}{idx:03d}{ext}"
        dest_orig_path = os.path.join(dest_folder, std_name)
        shutil.copy2(src_path, dest_orig_path)
        
        # Generate optimized WebP copy
        webp_name = f"{prefix}{idx:03d}.webp"
        dest_webp_path = os.path.join(dest_folder, webp_name)
        try:
            with Image.open(src_path) as img:
                img.save(dest_webp_path, "WEBP", quality=85, method=6)
        except Exception as e:
            print(f"Failed to generate webp for {f}: {e}")
            
        frame_list.append({
            "index": idx,
            "original_file": f,
            "standard_name": std_name,
            "webp_name": webp_name,
            "path": f"/assets/frames/{os.path.basename(dest_folder)}/{std_name}",
            "webp_path": f"/assets/frames/{os.path.basename(dest_folder)}/{webp_name}"
        })
        
    return frame_list

def main():
    base_assets = os.path.join("frontend", "public", "assets")
    frames_dir = os.path.join(base_assets, "frames")
    images_dir = os.path.join(base_assets, "images")
    os.makedirs(images_dir, exist_ok=True)
    
    # Process hero (important)
    hero_frames = process_folder("important", os.path.join(frames_dir, "hero"), "hero_")
    
    # Process delivery (product_delivery)
    delivery_frames = process_folder("product_delivery", os.path.join(frames_dir, "delivery"), "delivery_")
    
    # Process product details (product_details)
    product_frames = process_folder("product_details", os.path.join(frames_dir, "product"), "product_")
    
    # Process main.jpeg
    if os.path.exists("main.jpeg"):
        shutil.copy2("main.jpeg", os.path.join(images_dir, "main.jpeg"))
        try:
            with Image.open("main.jpeg") as img:
                img.save(os.path.join(images_dir, "main.webp"), "WEBP", quality=90)
            print("Optimized main.jpeg to main.webp successfully.")
        except Exception as e:
            print(f"Failed to optimize main.jpeg: {e}")
            
    print(f"\nSummary of Frame Counts:")
    print(f"Hero Frames: {len(hero_frames)}")
    print(f"Delivery Frames: {len(delivery_frames)}")
    print(f"Product Details Frames: {len(product_frames)}")
    
    # Write a JSON manifest for frontend consumption
    import json
    manifest = {
        "hero": {
            "count": len(hero_frames),
            "folder": "/assets/frames/hero",
            "frames": hero_frames
        },
        "delivery": {
            "count": len(delivery_frames),
            "folder": "/assets/frames/delivery",
            "frames": delivery_frames
        },
        "product": {
            "count": len(product_frames),
            "folder": "/assets/frames/product",
            "frames": product_frames
        }
    }
    
    manifest_path = os.path.join(base_assets, "frames_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as mf:
        json.dump(manifest, mf, indent=2)
    print(f"Wrote manifest to {manifest_path}")

if __name__ == "__main__":
    main()

