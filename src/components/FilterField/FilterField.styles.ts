import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token }) => ({
  field: {
    display: 'flex',
    alignItems: 'center',
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadius,
    overflow: 'hidden',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    '&:hover': { borderColor: token.colorPrimaryHover },
    '&:focus-within': {
      borderColor: token.colorPrimary,
      boxShadow: `0 0 0 2px ${token.colorPrimaryBg}`,
    },
  },
  label: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    maxWidth: '45%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingInline: token.paddingSM,
    userSelect: 'none',
  },
  separator: {
    width: 1,
    alignSelf: 'stretch',
    background: token.colorBorderSecondary,
    flexShrink: 0,
  },
  controlWrapper: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
}));
