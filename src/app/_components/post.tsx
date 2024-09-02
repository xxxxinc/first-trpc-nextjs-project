"use client";

import {useForm, type SubmitHandler} from 'react-hook-form'
import { api } from "~/trpc/react";
import Image from "next/image"

interface PostData {
  name: string;
  content: string;
  coverImage: File[];
}

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function PostForm() {
  const { register, handleSubmit } = useForm<PostData>();
  const uploadFileMutation = api.upload.uploadFile.useMutation();
  const createPostMutation = api.post.create.useMutation();

  const onSubmit: SubmitHandler<PostData> = async (data) => {
    let coverImageUrl = '';

    if (data.coverImage[0]) {
      const file = data.coverImage[0];

      // 将文件转换为 Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64String = reader.result?.toString().split(',')[1]; // 获取 Base64 字符串
        // 1. 通过 tRPC 上传 Base64 文件
        if (base64String) {
          const uploadResponse = await uploadFileMutation.mutateAsync({ file: base64String, fileName: file.name });
          coverImageUrl = uploadResponse.url;
        }

        // 2. 创建 Post
        await createPostMutation.mutateAsync({
          name: data.name,
          content: data.content,
          coverImage: coverImageUrl,
        });
      };
    }
  };

  return (
    <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-10 mt-10 rounded-md"
      >
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Add Post</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Title
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <input
                    {...register('name')} 
                    type="text"
                    placeholder="Title"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="Content" className="block text-sm font-medium leading-6 text-gray-900">
                Content
              </label>
              <div className="mt-2">
                <textarea
                  {...register('content')}
                  rows={3}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="cover-photo" className="block text-sm font-medium leading-6 text-gray-900">
                Cover photo
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      // htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        type="file"
                        {...register('coverImage')}
                        accept="image/*"
                        // className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-6 flex items-center gap-x-6">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          disabled={createPostMutation.isPending}
        >
          {createPostMutation.isPending ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  )
}

export function PostList() {
  const post = api.post.getList.useQuery();
  const defaultUrl = "/uploads/1725005138710-photo-1524758631624-e2822e304c36.avif";
  return (
    <>
      {post.isLoading? <p>Loading...</p> : null}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-8">
        {post.data?.map((post) => ( 
          <article key={post.id} className="overflow-hidden rounded-lg shadow transition hover:shadow-lg">
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
            <Image src={post.coverImage ?? defaultUrl} width="100" height={100} alt="cover image" className="h-56 w-full object-cover"></Image>

            <div className="bg-white p-4 sm:p-6 h-full">
              <time className="block text-xs text-gray-500"> {formatTimestamp(post.updatedAt.getTime())} </time>
      
              <a href="#">
                <h3 className="mt-0.5 text-lg text-gray-900">{post.name}</h3>
              </a>
      
              <p className="mt-2 line-clamp-3 text-sm/relaxed text-gray-500">
                {post.content}
              </p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export function IndexPost() {
  return (
    <div className="w-full">
      {PostList()}
      {PostForm()}
    </div>
  )
}
