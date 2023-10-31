"use client"
import React from "react"
import { Button } from "./ui/button"
import { ArrowRight } from "lucide-react"
import { trpc } from "@/app/_trpc/client"

const UpgradeButton = () => {
	const { mutate: createStripeSession } = trpc.creteStripeSession.useMutation({
		onSuccess: ({ url }) => {
			window.location.href = url ?? "/dashboard/billing"
		},
	})
	return (
		<Button className="w-full" onClick={() => createStripeSession()}>
			Upgrade now <ArrowRight className=" h-5 w-5 ml-1.5" />{" "}
		</Button>
	)
}

export default UpgradeButton
