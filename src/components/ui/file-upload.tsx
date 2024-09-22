"use client"

import * as React from 'react'
import {
  useDropzone as useReactDropzone,
  type DropzoneOptions as ReactDropzoneOptions,
  type DropzoneState as ReactDropzoneState,
} from 'react-dropzone'
import truncate from 'truncate'
import { Upload, FileText as PDF, Image, Trash } from "lucide-react"

import { cn } from '@/lib/utils'
import { ScrollArea } from "@/components/ui/scroll-area";

type DropzoneState = ReactDropzoneState

type FileUploadProps = {
  multiDropBehaviour: "add" | "replace"
  dropzoneOptions?: ReactDropzoneOptions | undefined
  files?: File[]
  onChange(files: File[]): void
}

type FileUploadContextProps = {
  dropzoneState: DropzoneState
  errorMessages: string[]
  removeFile(index: number): void
  multiDropBehaviour: "add" | "replace"
  dropzoneOptions?: ReactDropzoneOptions | undefined
  files: File[]
  onChange(files: File[]): void
}

const FileUploadContext = React.createContext<FileUploadContextProps | null>(null)

function useFileUpload() {
  const context = React.useContext(FileUploadContext)
  if (!context) {
    throw new Error("useFileUpload must be used within a <FileUpload />")
  }

  return context
}

const FileUpload = ({ className, children, dropzoneOptions, onChange, files: _files, multiDropBehaviour, ...props }: Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & FileUploadProps) => {
  const [files, setFiles] = React.useState<File[]>(_files ?? [])
  const [errorMessages, setErrorMessages] = React.useState<string[]>([])

  React.useEffect(() => onChange(files), [files])

  const onDrop = React.useCallback<Exclude<ReactDropzoneOptions["onDrop"], undefined>>((acceptedFiles, fileRejections, event) => {
    dropzoneOptions?.onDrop?.(acceptedFiles, fileRejections, event)
    let newErrorMessages: string[] = []
    try {
      if (fileRejections.length == 1) newErrorMessages.push(`Could not accept ${fileRejections[0].file.name}`)
      if (fileRejections.length > 1) newErrorMessages.push(`Could not accept ${fileRejections.length} files.`)
      if (multiDropBehaviour === "add" && dropzoneOptions?.maxFiles != null && files.length + acceptedFiles.length > dropzoneOptions.maxFiles ) {
        if (acceptedFiles.length === 1) newErrorMessages.push(`${acceptedFiles[0].name} was rejected as its acceptance would exceed the file count limit.`)
        if (acceptedFiles.length > 1) newErrorMessages.push(`${acceptedFiles.length} files were rejected as their acceptance would exceed the file count limit.`)
        return
      }
    } finally {
      setErrorMessages(newErrorMessages)
    }

    if (acceptedFiles.length === 0) return

    if (multiDropBehaviour === "add") setFiles(files => files.toSpliced(files.length, 0, ...acceptedFiles))
    if (multiDropBehaviour === "replace") setFiles(acceptedFiles)
  }, [files])

  const dropzoneState = useReactDropzone({ ...dropzoneOptions, onDrop })

  const removeFile = (index: number) => {
    setFiles(files => files.toSpliced(index, 1))
  }

  return (
    <FileUploadContext.Provider
      value={{
        dropzoneState,
        files,
        dropzoneOptions: dropzoneOptions,
        onChange,
        errorMessages,
        multiDropBehaviour,
        removeFile
      }}
    >
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        {children}
      </div>
    </FileUploadContext.Provider>
  )
}

const FileUploadDropzoneRoot = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { dropzoneState } = useFileUpload()

  return (
    <div
      className={cn(
        "flex justify-center items-center w-full h-32 border-dashed border-2 border-gray-200 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all select-none cursor-pointer",
        className,
      )}
      {...dropzoneState.getRootProps()}
      {...props}
    >
      {children}
    </div>
  )
}

const FileUploadDropzoneInput = ({ className, children, ...props }: React.HTMLAttributes<HTMLInputElement>) => {
  const { dropzoneState } = useFileUpload()

  return (
    <input className={className} {...dropzoneState.getInputProps()} {...props} />
  )
}

const FileUploadDropzoneBasket = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { dropzoneState, dropzoneOptions} = useFileUpload()

  if (dropzoneState.isDragAccept) return (
    <div className='text-sm font-medium'>Drop your files here!</div>
  )

  const MaxSizeTip = () => {
    if (dropzoneOptions?.maxSize == null) return null
    return (
      <div className='text-xs text-gray-400 font-medium'>
        Max. file size: {(dropzoneOptions.maxSize / (1024 * 1024)).toFixed(2)} MB
      </div>
    )
  }

  return (
    <div className={cn('flex items-center flex-col gap-1.5', className)} {...props}>
      <div className='flex items-center flex-row gap-0.5 text-sm font-medium'>
        <Upload className='mr-2 h-4 w-4'/> Upload files
      </div>
      <MaxSizeTip />
    </div>
  )
}

const FileUploadErrorMessage = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  const { errorMessages} = useFileUpload()
  if (errorMessages.length == 0) return null

  const renderMessage = (message: string, index: number) => (
    <span key={index} className={cn('text-xs text-red-600 mt-3', className)} {...props}>
      {message}
    </span>
  )

  return (errorMessages.map(renderMessage))
}

const FileUploadFileList = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { files, removeFile } = useFileUpload()
  if (files.length == 0) return null

  const renderFile = (file: File, index: number) => {
    return (
      <div
        key={index}
        className='flex justify-between items-center flex-row w-full h-16 mt-2 px-4 border-solid border-2 border-gray-200 rounded-lg shadow-sm'
      >
        <div className='flex items-center flex-row gap-4 h-full'>
          {
            file.type === 'application/pdf' ? (
              <PDF className='text-rose-700 w-6 h-6'/>
            ) : (
              <Image className='text-rose-700 w-6 h-6'/>
            )
          }
          <div className='flex flex-col gap-0'>
            <div className='text-[0.85rem] font-medium leading-snug'>
              {truncate(file.name.split('.').slice(0, -1).join('.'), 30)}
            </div>
            <div className='text-[0.7rem] text-gray-500 leading-tight'>
              .{file.name.split('.').pop()} • {(file.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          </div>
        </div>
        <div
          className='p-2 rounded-full border-solid border-2 border-gray-100 shadow-sm hover:bg-accent transition-all select-none cursor-pointer'
          onClick={() => removeFile(index)}
        >
          <Trash className='w-4 h-4'/>
        </div>
      </div>
    )
  }

  if (files.length <= 2) return (
    <div className='flex flex-col gap-2 w-full h-fit mt-2 pb-2' {...props}>
      <div className='w-full'>
        {files.map(renderFile)}
      </div>
    </div>
  )

  return (
    <ScrollArea className='flex flex-col gap-2 w-full h-48 mt-2 pb-2'>
      <div className='w-full pr-4'>
        {files.map(renderFile)}
      </div>
    </ScrollArea>
  )
}

export {
  useFileUpload,
  type DropzoneState,
  type FileUploadProps,
  type FileUploadContextProps,
  FileUpload,
  FileUploadDropzoneRoot,
  FileUploadDropzoneBasket,
  FileUploadDropzoneInput,
  FileUploadErrorMessage,
  FileUploadFileList,
}
