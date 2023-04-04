import { stripe } from "@/lib/stripe"
import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from "@/styles/pages/product"
import axios from "axios"
import { GetStaticPaths, GetStaticProps } from "next"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/router"
import React, { useState } from "react"
import Stripe from "stripe"

type ProductData = {
  id: string
  name: string
  imageUrl: string
  price: string
  description: string
  defaultPriceId: string
}

interface ProductProps {
  product: ProductData
}

const Product = ({ product }: ProductProps) => {
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false)
  const { isFallback } = useRouter()

  if (isFallback) {
    return <p>loading...</p>
  }

  async function handleBuyProduct() {
    try {
      setIsRedirectingToCheckout(true)
      const response = await axios.post("/api/stripe", {
        priceId: product.defaultPriceId,
      })

      const { checkoutUrl } = response.data

      window.location.href = checkoutUrl
    } catch (err) {
      // Conectar com uma ferramenta de observabilidade como (Datadog / Sentry)

      setIsRedirectingToCheckout(false)
      console.error(err)
    }
  }
  return (
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>
      <ProductContainer>
        <ImageContainer>
          <Image
            src={product.imageUrl}
            alt=""
            width={520}
            height={480}
            priority
          />
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>
          <p>{product.description}</p>

          <button disabled={isRedirectingToCheckout} onClick={handleBuyProduct}>
            Comprar agora
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  )
}

export default Product

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: { id: "prod_NHjoS4qpQMqaC8" },
      },
    ],
    fallback: true,
  }
}
export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params,
}) => {
  const productId = params?.id

  //@ts-ignore
  const product = await stripe.products.retrieve(productId, {
    expand: ["default_price"],
  })

  const price = product.default_price as Stripe.Price

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],

        price: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          //@ts-ignore
        }).format(price.unit_amount / 100),
        description: product.description,
        defaultPriceId: price.id,
      },
    },
    revalidate: 60 * 60 * 1,
  }
}
