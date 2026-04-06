import Image from "next/image";

export function NavLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/nav-logo.png" alt="SkillBytes Logo" width={100} height={100} />

    </div>
  )
}
