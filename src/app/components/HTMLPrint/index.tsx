import dayjs from "dayjs";
import React, { useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Wrapper from "./Wrapper";

const HtmlPrint: React.FC<any> = ({ setNamePrint, html, setHtml, namePrint, pageStyle = `` }) => {
	const componentRef = useRef<HTMLDivElement | null>(null);

	const handlePrint = useReactToPrint({
		content: () => componentRef.current,
		documentTitle: `${namePrint}_${dayjs().format("DDMMYYYY")}_${dayjs().format("HHmm")}`,
		pageStyle,
	});

	useEffect(() => {
		if (html) {
			handlePrint?.();
			setHtml("");
			setNamePrint("");
		}

		return () => {
			// remove khi component unmounted
			setNamePrint("");
			setHtml("");
            componentRef.current = null
		};
	}, [html]);

	return (
        <Wrapper>
            <div>
                <div style={{ display: "none" }}>
                    <div className="print-upbase" ref={componentRef} dangerouslySetInnerHTML={{ __html: html }} />
                </div>
            </div>
        </Wrapper>
	);
};

export default HtmlPrint;
