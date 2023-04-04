import { globalStyles } from "@/styles/global"
import { Container, Header } from "@/styles/pages/app"
import type { AppProps } from "next/app"
import Image from "next/image"
import Link from "next/link"

globalStyles()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Container>
      <Header>
        <Link href="/">
          <Image src="/logo.svg" alt="" width={129} height={52} priority />
        </Link>
      </Header>
      <Component {...pageProps} />
    </Container>
  )
}
