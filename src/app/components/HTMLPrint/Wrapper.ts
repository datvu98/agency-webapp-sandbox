import styled from "styled-components";

const Wrapper = styled.div`
	.print-upbase,
	.print-upbase *,
	.print-upbase *::before,
	.print-upbase *::after {
		border-width: revert;
		border-style: revert;
		border-color: revert;
	}

	.print-upbase {
		.c32 {
			page-break-before: always !important;
		}

		table[border="1"] > tbody > tr > td,
		table[border="1"] > tbody > tr > th,
		table[border="1"] > thead > tr > td,
		table[border="1"] > thead > tr > th,
		table[border="1"] > tfoot > tr > td,
		table[border="1"] > tfoot > tr > th {
			border-width: 1px !important;
			border-style: solid !important;
			border-color: #000 !important;
		}
	}
`;

export default Wrapper;
