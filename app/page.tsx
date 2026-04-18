import { Suspense } from "react";
import EduSphereHome from "@/components/EduSphereHome";
import { PageLoader } from "@/components/PageLoader";

export default function HomePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <EduSphereHome />
    </Suspense>
  );
}
