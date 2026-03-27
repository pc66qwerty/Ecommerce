import Image from "next/image";

interface BannerProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  badgeText?: string;
}

export default function BannerImage({ imageUrl, title, subtitle, badgeText }: BannerProps) {
  return (
    <div className="relative w-full h-80 md:h-[400px] overflow-hidden rounded-b-[40px] md:rounded-b-[60px] shadow-md group border-b border-gray-100">
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover object-center group-hover:scale-105 transition-transform duration-1000"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#111]/90 via-[#111]/40 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 max-w-7xl mx-auto flex flex-col justify-end h-full">
         <div className="max-w-xl">
             {badgeText && (
               <span className="inline-block bg-[#ff5000] text-white text-[10px] md:text-sm font-black uppercase tracking-widest px-3 py-1 mb-4 rounded-full shadow-sm">
                 {badgeText}
               </span>
             )}
             <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-2 tracking-tighter drop-shadow-lg">
                 {title}
             </h1>
             <p className="text-gray-200 text-sm md:text-lg font-medium drop-shadow-md max-w-md">
                 {subtitle}
             </p>
         </div>
      </div>
    </div>
  );
}
