"use client"
import { ChevronDown, ChevronUp, Loader2, RotateCw, Search } from "lucide-react"
import { Document, Page, pdfjs } from "react-pdf"

import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { useToast } from "./ui/use-toast"
import { useResizeDetector } from "react-resize-detector"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu"

import SimpleBar from "simplebar-react"
import PDFFullScreen from "./PDFFullScreen"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface PdfRendererProps {
	url: string
}

const PDFRenderer = ({ url }: PdfRendererProps) => {
	const [numPages, setNumPages] = useState<number>()
	const [currPage, setCurrPage] = useState<number>(1)
	const [scale, setScale] = useState<number>(1)
	const [rotation, setRotation] = useState<number>(0)
	const [renderedScale, setRenderedScale] = useState<number | null>(null)

	const isLoading = renderedScale !== scale

	const CustomPageValidator = z.object({
		page: z
			.string()
			.refine((num) => Number(num) > 0 && Number(num) <= numPages!),
	})

	type TCustomPageValidor = z.infer<typeof CustomPageValidator>

	const { toast } = useToast()
	const { width, ref } = useResizeDetector()
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<TCustomPageValidor>({
		defaultValues: {
			page: "1",
		},
		resolver: zodResolver(CustomPageValidator),
	})

	const handlePageSubmit = ({ page }: TCustomPageValidor) => {
		setCurrPage(Number(page))
		setValue("page", String(page))
	}
	return (
		<div className="w-full bg-white rounded-md shadow flex flex-col items-center">
			<div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
				<div className="flex items-center gap-1.5">
					<Button
						aria-label="previous page"
						variant={"ghost"}
						onClick={() => {
							setCurrPage((p) => (p - 1 > 1 ? p - 1 : 1))
							setValue("page", String(currPage - 1))
						}}
						disabled={currPage <= 1}
					>
						<ChevronDown className="w-4 h-4" />
					</Button>
					<div className="flex items-center gap-1.5">
						<Input
							{...register("page")}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleSubmit(handlePageSubmit)()
								}
							}}
							className={cn(
								"w-12 h-8",
								errors.page && "focus-visible:ring-red-500"
							)}
							defaultValue={1}
						/>
						<p className="text-zinc-700 text-sm space-x-1">
							<span>/</span>
							<span>{numPages ?? "x"}</span>
						</p>
					</div>
					<Button
						disabled={numPages === undefined || currPage === undefined}
						aria-label="next page"
						variant={"ghost"}
						onClick={() => {
							setCurrPage((p) => (p + 1 > numPages! ? numPages! : p + 1))
							setValue("page", String(currPage + 1))
						}}
					>
						<ChevronUp className="w-4 h-4" />
					</Button>
				</div>
				<div className="space-x-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button className="gap-1.5" aria-label="zoom" variant="ghost">
								<Search className="h-4 w-4" />
								{scale * 100}% <ChevronDown className="h-3 w-3 opacity-50" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onSelect={() => setScale(1)}>
								100%
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => setScale(1.5)}>
								150%
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => setScale(2)}>
								200%
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => setScale(2.5)}>
								250%
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Button
						aria-label="rotate 90 deg"
						variant="ghost"
						onClick={() => setRotation((p) => p + 90)}
					>
						<RotateCw className="h-4 w-4" />{" "}
					</Button>
					<PDFFullScreen fileUrl={url} />
				</div>
			</div>
			<div className="flex-1 w-full max-h-screen">
				<SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
					<div ref={ref}>
						<Document
							file={url}
							className="max-h-full"
							loading={
								<div className="flex justify-center">
									<Loader2 className="my-24 h-6 w-6 animate-spin" />
								</div>
							}
							onLoadError={() => {
								toast({
									title: "Error",
									description: "Please try again later",
									variant: "destructive",
								})
							}}
							onLoadSuccess={({ numPages }) => {
								setNumPages(numPages)
							}}
						>
							{isLoading && renderedScale ? (
								<Page
									pageNumber={currPage}
									width={width ? width : 1}
									scale={scale}
									rotate={rotation}
									key={"@" + renderedScale}
								/>
							) : null}
							<Page
								className={cn(isLoading ? "hidden" : "")}
								pageNumber={currPage}
								width={width ? width : 1}
								scale={scale}
								rotate={rotation}
								key={"@" + scale}
								loading={
									<div className="flex justify-center">
										<Loader2 className="my-24 h-6 w-6 animate-spin" />
									</div>
								}
								onRenderSuccess={() => setRenderedScale(scale)}
							/>
						</Document>
					</div>
				</SimpleBar>
			</div>
		</div>
	)
}
export default PDFRenderer
