## GET /chapter_recitations/{id}/{chapter_number} - 200
```diff
--- docs
+++ code
@@ -1,9 +1,10 @@
 {
   "audio_file": {
-    "id": 457,
-    "chapter_id": 1,
-    "file_size": 710784.0,
+    "id": 43,
+    "chapter_id": 22,
+    "file_size": 19779712,
     "format": "mp3",
-    "audio_url": "https://download.quranicaudio.com/qdc/abu_bakr_shatri/murattal/1.mp3"
+    "total_files": 1,
+    "audio_url": "https://download.quranicaudio.com/quran/abdullaah_3awwaad_al-juhaynee//022.mp3"
   }
 }
```
## GET /quran/translations/{translation_id} - 200
```diff
--- docs
+++ code
@@ -5,10 +5,6 @@
       "text": "In the Name of Allah—the Most Compassionate, Most Merciful."
     }
   ],
-  "foot_notes": {
-    "1": "Some editions note variant readings here.",
-    "a": "See introduction for translator's methodology."
-  },
   "meta": {
     "translation_name": "Dr. Mustafa Khattab, the Clear Quran",
     "author_name": "Dr. Mustafa Khattab"
```
## GET /recitations/{recitation_id}/by_chapter/{chapter_number} - 200
```diff
--- docs
+++ code
@@ -2,38 +2,22 @@
   "audio_files": [
     {
       "verse_key": "1:1",
-      "url": "Alafasy/mp3/001001.mp3"
+      "url": "AbdulBaset/Mujawwad/mp3/001001.mp3"
     },
     {
       "verse_key": "1:2",
-      "url": "Alafasy/mp3/001002.mp3"
+      "url": "AbdulBaset/Mujawwad/mp3/001002.mp3"
     },
     {
       "verse_key": "1:3",
-      "url": "Alafasy/mp3/001003.mp3"
-    },
-    {
-      "verse_key": "1:4",
-      "url": "Alafasy/mp3/001004.mp3"
-    },
-    {
-      "verse_key": "1:5",
-      "url": "Alafasy/mp3/001005.mp3"
-    },
-    {
-      "verse_key": "1:6",
-      "url": "Alafasy/mp3/001006.mp3"
-    },
-    {
-      "verse_key": "1:7",
-      "url": "Alafasy/mp3/001007.mp3"
+      "url": "AbdulBaset/Mujawwad/mp3/001003.mp3"
     }
   ],
   "pagination": {
     "per_page": 10,
     "current_page": 1,
-    "next_page": null,
-    "total_pages": 1,
-    "total_records": 7
+    "next_page": 2,
+    "total_pages": 2,
+    "total_records": 20
   }
 }
```
## GET /resources/tafsirs - 200
```diff
--- docs
+++ code
@@ -4,7 +4,7 @@
       "id": 169,
       "name": "Tafsir Ibn Kathir",
       "author_name": "Hafiz Ibn Kathir",
-      "slug": "en-tafsir-ibn-kathir",
+      "slug": "en-tafisr-ibn-kathir",
       "language_name": "english",
       "translated_name": {
         "name": "Tafsir Ibn Kathir",
```