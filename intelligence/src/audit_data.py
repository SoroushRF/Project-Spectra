import os

DATA_DIR = os.path.join("intelligence", "data", "archive")
SETS = ["train", "test"]

def audit_dataset():
    print(f"🕵️  Auditing Project Spectra Dataset: {DATA_DIR}")
    
    overall_count = 0
    
    for s in SETS:
        set_path = os.path.join(DATA_DIR, s)
        if not os.path.exists(set_path):
            print(f"❌ Error: {s} directory not found.")
            continue
            
        print(f"\n📂 Set: {s.upper()}")
        emotions = os.listdir(set_path)
        set_count = 0
        
        for emotion in emotions:
            emotion_path = os.path.join(set_path, emotion)
            if os.path.isdir(emotion_path):
                file_count = len([f for f in os.listdir(emotion_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
                print(f"  - {emotion:<10}: {file_count} images")
                set_count += file_count
        
        print(f"📍 Subtotal for {s}: {set_count} images")
        overall_count += set_count

    print(f"\n✅ AUDIT COMPLETE. Total dataset size: {overall_count} images.")

if __name__ == "__main__":
    audit_dataset()
