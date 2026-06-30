import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token }) => ({
  body: {
    padding: `${token.paddingLG}px 0`,
  },
  label: {
    display: 'block',
    marginBottom: token.marginXS,
    color: token.colorText,
    fontSize: token.fontSize,
  },
}));
