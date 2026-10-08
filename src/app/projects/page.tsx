import ProjectsHub from "@/components/projects/projects-hub";
import { pageTitle } from "@/lib/brand";

export const metadata = {
  title: pageTitle("Projects"),
};

export default function ProjectsPage() {
  return <ProjectsHub />;
}
