import { stripe } from "@/lib/stripe"
import { ImageContainer, SuccessContainer } from "@/styles/pages/success"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import Stripe from "stripe"

interface SuccessProps {
  customerName: string
  product: {
    name: string
    imageUrl: string
  }
}

const success = ({ customerName, product }: SuccessProps) => {
  return (
    <>
      <Head>
        <title>Compra efetuada | Ignite Shop</title>
        <meta name="robots" content="noindex" />
      </Head>
      <SuccessContainer>
        <h1>Compra efetuada!</h1>

        <ImageContainer>
          <Image
            src={product?.imageUrl}
            alt=""
            width={120}
            height={110}
            priority
          />
        </ImageContainer>

        <p>
          Uhuuuul, <strong>{customerName}</strong>, sua{" "}
          <strong>{product?.name}</strong> já está a caminho da sua casa.
        </p>

        <Link href="/">Voltar ao catálogo</Link>
      </SuccessContainer>
    </>
  )
}

export default success

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.session_id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  const sessionId = String(query.session_id)

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "line_items.data.price.product"],
  })

  const customerName = session.customer_details?.name
  //@ts-ignore
  const product = session.line_items?.data[0].price.product as Stripe.Product

  return {
    props: {
      customerName,
      product: {
        name: product.name,
        imageUrl: product.images[0],
      },
    },
  }
}
