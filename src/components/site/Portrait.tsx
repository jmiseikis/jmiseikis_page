import portrait480 from "@/assets/portrait-480.webp";
import portrait800 from "@/assets/portrait-800.webp";
import portrait1200 from "@/assets/portrait-1200.webp";
import portraitJpg from "@/assets/portrait-800.jpg";
import { cn } from "@/lib/utils";

/** Responsive portrait. The hero copy loads it eagerly; lower-page uses lazy-load. */
const Portrait = ({
  className,
  imgClassName,
  sizes = "(min-width: 768px) 45vw, 100vw",
  eager = false,
  alt = "Dr. Justinas Mišeikis speaking on stage at a technology event",
}: {
  className?: string;
  imgClassName?: string;
  sizes?: string;
  eager?: boolean;
  alt?: string;
}) => (
  <picture className={className}>
    <source type="image/webp" srcSet={`${portrait480} 480w, ${portrait800} 800w, ${portrait1200} 1200w`} sizes={sizes} />
    <img
      src={portraitJpg}
      alt={alt}
      width={800}
      height={800}
      loading={eager ? "eager" : "lazy"}
      decoding={eager ? "sync" : "async"}
      {...(eager ? { fetchpriority: "high" } : {})}
      className={cn("block h-auto w-full object-cover grayscale", imgClassName)}
    />
  </picture>
);

export default Portrait;
