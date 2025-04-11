import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { OrdersTable } from "~/app/_components/OrdersTable";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center custom-bg text-white">
        <div className="container flex flex-col  justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[4rem]">
            Order <span className="text-[hsl(280,100%,70%)]">Tracker</span>
          </h1>
          
          

          <OrdersTable />
        </div>
      </main>
    </HydrateClient>
  );
}
