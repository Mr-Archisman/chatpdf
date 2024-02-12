"use client"

import { uploadToS3 } from '@/lib/s3'
import { useMutation } from '@tanstack/react-query'
import { Inbox, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import {useDropzone} from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'

type Props = {}

const FileUpload = () => {
    const [uploading,setUploading]= useState(false)
    const {mutate,isPending} = useMutation({
        mutationFn: async ({file_key,file_name} : {file_key:string,file_name:string}) => {
            const response = await axios.post('/api/create-chat',{
                file_key,file_name  
            })
            return response.data
        } 
    })

    const {getInputProps,getRootProps} = useDropzone({
        accept:{"application/pdf": [".pdf"]},
        maxFiles:1,
        onDrop: (async (acceptedFiles)=> {
            console.log(acceptedFiles)
            const file = acceptedFiles[0]
            if(file.size > 10 * 1024 * 1024){
                toast.error("please upload a smller file ")
                return
            }

            try {
                const data = await uploadToS3(file)    
                if(!data.file_name || !data.file_name){
                    toast.error("something went wrong")
                    return
                } 
                mutate(data, {
                    onSuccess: (data) => {
                        console.log(data)
                        // toast.success(data.message)
                    },
                    onError : (err) => {
                        toast.error('error cretaing chat')
                    }
                })           
            } catch (error) {
                console.log(error)
            }


        })
    });
  return (
    <div className='p-2 bg-white rounded-2xl'>
        <div {...getRootProps({
            className:"border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col"
        })} >
            <input {...getInputProps()}/>
            {uploading || isPending ? (
                <>
                    <Loader2 className='h-10 w-10 text-blue-500 animate-spin'/>
                    <p className='mt-2 text-sm text-slate-400'>Spilling to GPT..</p>
                </>
            ) : ( 
                <>
                <Inbox className='w-10 h-10 text-blue-500 '/> 
                <p className='mt-2 text-slate-600 text-sm'>Drop PDF here</p>
                </>
            )}
            
        </div>
    </div>
  )
}

export default FileUpload