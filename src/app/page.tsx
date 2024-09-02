
import { IndexPost } from "~/app/_components/post";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-200">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <IndexPost />
        </div>
      </main>
    </HydrateClient>
  );
}
