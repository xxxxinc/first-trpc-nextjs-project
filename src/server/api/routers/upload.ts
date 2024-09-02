import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

export const uploadRouter = createTRPCRouter({
  uploadFile: publicProcedure
    .input(z.object({
      file: z.string(), // 接收 Base64 字符串
      fileName: z.string(), // 接收文件名
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.file, 'base64'); // 将 Base64 解码为 Buffer
      const uploadDir = path.join(process.cwd(), 'public/uploads');

      // 确保上传目录存在
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, `${Date.now()}-${input.fileName}`);
      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${path.basename(filePath)}`;
      return { url: fileUrl };
    }),
});
