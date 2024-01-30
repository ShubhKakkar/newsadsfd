import { useRouter } from "next/router";
import { translate } from "@/fn";

const useTranslate = () => {
  const { locale } = useRouter();

  const t = (text) => {
    return translate(locale, text);
  };

  return t;
};

export default useTranslate;
