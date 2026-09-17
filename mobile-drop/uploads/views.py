from django.shortcuts import redirect, render, get_object_or_404
from django.http import HttpResponse
from .models import UploadedFile
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse


@login_required
def home(request):

    uploaded_files = UploadedFile.objects.all().order_by('-uploaded_at')
    return render(request, 'uploads/home.html', {'uploaded_files': uploaded_files})


@login_required
def upload(request):
        if request.method != 'POST':
            return redirect('home')  # Redirige a la página de inicio si no es una solicitud POST
        
        files = request.FILES.getlist('files')

        if not files:
            return JsonResponse(
                 {
                      "success": False,
                        "message": "No has seleccionado niingún archivo para subir."
                 },
                 status=400,
            )

        uploaded_files = []  



        for file in files:
            uploaded_file = UploadedFile.objects.create(
                file=file,
                original_name=file.name,
                size=file.size,
                content_type=file.content_type
            )

            uploaded_files.append(
                 {
                        "id":  uploaded_file.id,
                        "original_name": uploaded_file.original_name,
                        "size": uploaded_file.size,
                        "content_type": uploaded_file.content_type,
                 }
            )

        return JsonResponse(
            {
                "success": True,
                "uploaded_count": len(uploaded_files),
                "message":( f"Se han subido {len(uploaded_files)} archivo(s) correctamente."
                ),
    
                "files": uploaded_files,
            
            }
        )

        messages.success(
            request,
            f"Se han subido {len(uploaded_files)} archivo(s) correctamente."
        )

        return redirect('home')  # Redirige a la página de inicio después de subir los archivos

        return redirect('home')  # Redirige a la página de inicio si no es una solicitud POST

@login_required
def delete_file(request, file_id):
    if request.method == 'POST':
        uploaded_file= get_object_or_404(UploadedFile, id=file_id)
        filename = uploaded_file.original_name  # Guarda el nombre del archivo antes de eliminarlo
        uploaded_file.file.delete(save=False)  # Elimina el archivo del sistema de archivos
        uploaded_file.delete()  # Elimina el registro de la base de datos

        messages.success(
            request,
            f"El archivo '{filename}' ha sido eliminado correctamente."
        )
    return redirect('home')  # Redirige a la página de inicio después de eliminar el archivo
