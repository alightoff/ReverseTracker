import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { toast } from "react-toastify"; // импорт toast

export default function CourseFileUploader({ onFileAccepted }) {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        onFileAccepted(json);
        toast.success("✅ Файл успешно загружен");
      } catch (err) {
        toast.error("❗ Ошибка: файл не является валидным JSON");
      }
    };

    reader.readAsText(file);
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition 
        ${isDragActive ? "border-hackerGreen bg-hackerGreen/10" : "border-zinc-400 dark:border-zinc-600"}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Отпустите файл здесь...</p>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-300">
          Перетащите сюда файл курса (JSON) или нажмите для выбора
        </p>
      )}
    </div>
  );
}
