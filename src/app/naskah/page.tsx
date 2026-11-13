import { Suspense } from "react";
import NaskahClient from "./NaskahClient";

export default function NaskahPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Memuat...</p>}>
      <NaskahClient />
    </Suspense>
  );
}
