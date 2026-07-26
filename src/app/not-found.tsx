import Link from "next/link";
import Image from "next/image";
export default function NotFound() {
  return (
    <div>
     <Image src="/notfound.png" alt="Not Found" className="h-screen w-full justify-center items-center" height={200} width={400} />
    </div>
  );
}
