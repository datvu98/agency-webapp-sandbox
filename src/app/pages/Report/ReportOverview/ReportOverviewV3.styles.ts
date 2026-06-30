import { createStyles } from 'antd-style';

export const useStylesV3 = createStyles(({ token }) => ({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: token.paddingLG,
    maxWidth: 1440,
    margin: '0 auto',
    width: '100%',
    paddingInline: token.paddingLG,
    paddingBottom: token.paddingXL,
  },
  filterBar: {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    padding: token.paddingLG,
  },
  chartSection: {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    padding: token.paddingLG,
    overflow: 'hidden',
  },
  tableSection: {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    overflow: 'hidden',
  },
  tableSectionHeader: {
    padding: `${token.paddingLG}px ${token.paddingLG}px ${token.paddingSM}px`,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
  },
  tableContent: {
    padding: token.paddingLG,
  },
  sectionTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
  },
}));
