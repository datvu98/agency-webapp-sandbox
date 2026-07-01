import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token }) => ({
  summaryBlock: {
    marginBottom: token.marginMD,
    display: 'flex',
    flexDirection: 'column',
    gap: token.marginXS,
  },
  summaryRow: {
    color: token.colorText,
    fontSize: token.fontSize,
  },
  failCount: {
    color: token.colorError,
    fontWeight: token.fontWeightStrong,
  },
  successCount: {
    color: token.colorSuccess,
    fontWeight: token.fontWeightStrong,
  },
  tableWrapper: {
    marginTop: token.marginSM,
  },
}));
