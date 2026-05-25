import { Badge } from "@/components/ui/badge";

type SkillStackProps = {
  title: string;
  skills: readonly string[];
};

function SkillGroup({ title, skills }: SkillStackProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <ul className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <li key={skill}>
            <Badge variant="outline">{skill}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

type ProfileSkillStacksProps = {
  frontend: readonly string[];
  backend: readonly string[];
};

export function ProfileSkillStacks({
  frontend,
  backend,
}: ProfileSkillStacksProps) {
  return (
    <section aria-labelledby="skills-heading" className="space-y-5">
      <h2 id="skills-heading" className="text-sm font-medium text-foreground">
        技术栈
      </h2>
      <SkillGroup title="前端" skills={frontend} />
      <SkillGroup title="后端" skills={backend} />
    </section>
  );
}
