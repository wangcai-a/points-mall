import os
import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/upload", tags=["upload"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="不支持的文件格式，仅支持 jpg, jpeg, png, gif, webp")
    
    file_extension = file.filename.rsplit(".", 1)[1].lower()
    new_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)
    
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")
    
    return {"code": 200, "data": {"image_url": f"/uploads/{new_filename}"}}

@router.delete("/image")
async def delete_image(image_url: str):
    if not image_url.startswith("/uploads/"):
        raise HTTPException(status_code=400, detail="无效的图片路径")
    
    filename = image_url.replace("/uploads/", "")
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"code": 200, "message": "删除成功"}
    else:
        raise HTTPException(status_code=404, detail="图片不存在")