import { HomeContainer, Product } from "@/styles/pages/home"
import Head from "next/head"
import Image from "next/image"

import { useKeenSlider } from "keen-slider/react"

import "keen-slider/keen-slider.min.css"
import { GetStaticProps } from "next"
import { stripe } from "@/lib/stripe"
import Stripe from "stripe"
import Link from "next/link"

type ProductProps = {
  id: string
  name: string
  imageUrl: string
  price: string
}[]

interface HomeProps {
  products: ProductProps
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    },
  })

  return (
    <>
      <Head>
        <title>Home | Ignite Shop</title>
        <meta name="description" content="Projeto ignite 2022" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomeContainer ref={sliderRef} className="keen-slider">
        {products.map((product) => (
          <Link
            href={`/product/${product?.id}`}
            key={product.id}
            prefetch={false}
          >
            <Product className="keen-slider__slide">
              <Image
                src={product.imageUrl}
                alt=""
                width={520}
                height={520}
                priority
              />

              <footer>
                <strong>{product.name}</strong>
                <span>{product.price}</span>
              </footer>
            </Product>
          </Link>
        ))}
      </HomeContainer>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ["data.default_price"],
  })

  const products = response.data.map((product) => {
    const price = product.default_price as Stripe.Price

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],

      price: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        //@ts-ignore
      }).format(price.unit_amount / 100),
    }
  })

  return {
    props: { products },
    revalidate: 60 * 60 * 2,
  }
}
