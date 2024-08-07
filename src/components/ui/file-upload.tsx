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
import {ScrollArea} from "@/components/ui/scroll-area";

type DropzoneState = ReactDropzoneState

type FileUploadProps = {
  options?: ReactDropzoneOptions | undefined
  onChange(files: File[]): void
}

type FileUploadContextProps = {
  dropzoneState: DropzoneState
  files: File[]
  errorMessage: string | undefined
  removeFile(index: number): void
} & FileUploadProps

const FileUploadContext = React.createContext<FileUploadContextProps | null>(null)

function useFileUpload() {
  const context = React.useContext(FileUploadContext)
  if (!context) {
    throw new Error("useDropzone must be used within a <Dropzone />")
  }

  return context
}

const FileUpload = ({ className, children, options, onChange, ...props }: Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & FileUploadProps) => {
  const [files, setFiles] = React.useState<File[]>([])
  const [errorMessage, setErrorMessage] = React.useState<string>()

  React.useEffect(() => onChange(files), [files])

  const dropzoneState = useReactDropzone({
    ...options,
    onDrop(acceptedFiles, fileRejections, event) {
      options?.onDrop?.(acceptedFiles, fileRejections, event)
      if (fileRejections.length > 0) {
        let _errorMessage = `Could not accept ${ fileRejections[0].file.name }`
        if (fileRejections.length > 1) _errorMessage += `, and ${ fileRejections.length - 1 } other files.`
        setErrorMessage(_errorMessage)
      } else {
        setErrorMessage(undefined)
      }
      if (acceptedFiles.length > 0) setFiles(files => [...files, ...acceptedFiles])
    },
  })

  const removeFile = (index: number) => {
    setFiles(files => files.toSpliced(index, 1))
  }

  function ContextProvider({ children, ...props }: Omit<React.ComponentProps<typeof FileUploadContext.Provider>, "value">) {
    return (
      <FileUploadContext.Provider
        value={{
          dropzoneState,
          files,
          options,
          onChange,
          errorMessage,
          removeFile
        }}
        {...props}
      >
        {children}
      </FileUploadContext.Provider>
    )
  }

  return (
    <ContextProvider>
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        {children}
      </div>
    </ContextProvider>
  )
}

const FileUploadDropzoneRoot = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { dropzoneState: { getRootProps }} = useFileUpload()

  const { className: classNameFromDropzone, ...propsFromDropzone} = getRootProps()

  return (
    <div
      className={cn(
        classNameFromDropzone,
        "flex justify-center items-center w-full h-32 border-dashed border-2 border-gray-200 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all select-none cursor-pointer",
        className,
      )}
      {...propsFromDropzone}
      {...props}
    >
      {children}
    </div>
  )
}

const FileUploadDropzoneInput = ({ className, children, ...props }: React.HTMLAttributes<HTMLInputElement>) => {
  const { dropzoneState: { getInputProps }} = useFileUpload()

  const { className: classNameFromDropzone, ...propsFromDropzone } = getInputProps()

  return (
    <input className={cn(classNameFromDropzone, className)} {...getInputProps()} {...props} />
  )
}

const FileUploadDropzoneBasket = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { dropzoneState, options} = useFileUpload()

  if (dropzoneState.isDragAccept) return (
    <div className='text-sm font-medium'>Drop your files here!</div>
  )
  
  const MaxSizeTip = () => {
    if (options?.maxSize == null) return null
    return (
      <div className='text-xs text-gray-400 font-medium'>
        Max. file size: {(options.maxSize / (1024 * 1024)).toFixed(2)} MB
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
  const { errorMessage} = useFileUpload()
  if (errorMessage == null) return null
  return (
    <span className={cn('text-xs text-red-600 mt-3', className)} {...props}>
      { errorMessage }
   </span>
  )
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
