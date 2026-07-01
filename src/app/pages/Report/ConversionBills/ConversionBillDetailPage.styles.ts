import { createStyles } from 'antd-style';

export const useDetailStyles = createStyles(({ token }) => ({
  page: {
    background: token.colorBgLayout,
    minHeight: '100vh',
    padding: token.paddingLG,
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: token.paddingXXS,
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    marginBottom: token.paddingSM,
    cursor: 'pointer',
    '&:hover': {
      color: token.colorPrimary,
    },
  },
  headerCard: {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    padding: token.paddingLG,
    marginBottom: token.paddingLG,
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: token.paddingLG,
  },
  billCode: {
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    color: token.colorText,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: `${token.paddingSM}px ${token.paddingLG}px`,
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: token.paddingXXS,
  },
  metaLabel: {
    fontSize: token.fontSizeSM,
    color: token.colorTextTertiary,
  },
  metaValue: {
    fontSize: token.fontSize,
    color: token.colorText,
    fontWeight: token.fontWeightStrong,
  },
  tableCard: {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    padding: token.paddingLG,
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: token.paddingLG,
  },
  tableTitle: {
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
    color: token.colorText,
  },
  statusTransition: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: token.paddingXXS,
  },
  arrow: {
    color: token.colorTextTertiary,
    fontSize: 12,
  },
  itemName: {
    display: 'inline-block',
    maxWidth: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    verticalAlign: 'middle',
  },
}));
