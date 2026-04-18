import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollegeDetailPremium } from "./CollegeDetailPremium";
import { getSimilarColleges, resolveCollegeById } from "@/lib/colleges-merge";

type Props = { searchParams: Promise<{ id?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { id } = await searchParams;
  if (!id) return { title: "College — EduSphere" };
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    /* use raw */
  }
  const college = await resolveCollegeById(decoded);
  if (!college) return { title: "College — EduSphere" };
  return {
    title: `${college.name} — EduSphere`,
    description: `${college.type} in ${college.district}, ${college.state}. Explore programmes, fees snapshot, and compare on EduSphere.`,
  };
}

export default async function CollegeDetailPage({ searchParams }: Props) {
  const { id } = await searchParams;
  if (!id) notFound();
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    /* use raw */
  }
  const college = await resolveCollegeById(decoded);
  if (!college) notFound();

  const similar = await getSimilarColleges(decoded, 6);

  return <CollegeDetailPremium college={college} similar={similar} />;
}
