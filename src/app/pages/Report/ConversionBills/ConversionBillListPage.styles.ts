import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token }) => ({
  page: {
    background: token.colorBgLayout,
    minHeight: '100vh',
    padding: token.paddingLG,
  },
  card: {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    padding: token.paddingLG,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: token.paddingLG,
  },
  title: {
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    color: token.colorText,
  },
  billCode: {
    color: token.colorPrimary,
    fontWeight: token.fontWeightStrong,
  },
  staffName: {
    display: 'inline-block',
    maxWidth: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    verticalAlign: 'middle',
  },
}));
