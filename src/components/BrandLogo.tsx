import logoAsset from "@/assets/basnion-logo.png.asset.json";
import { useLogoUrl } from "@/lib/storage";

type Props = React.ImgHTMLAttributes<HTMLImageElement>;

export function BrandLogo({ alt = "Basnion", ...rest }: Props) {
  const url = useLogoUrl();
  return <img src={url ?? logoAsset.url} alt={alt} {...rest} />;
}
