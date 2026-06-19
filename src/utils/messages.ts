import dayjs from 'dayjs';
import { reverse, groupBy, sortBy } from 'lodash';
import moment from 'moment';

const user = !!localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '') : {}

export const _t = (id: string, ...rest: any[]): [string, ...any[]] => {
  if (!id) {
    id = '_NOT_TRANSLATED_';
  }
  return [id, ...rest];
};

export const parseMesssage = (messages: Array<any>, currentConversation: any, isAppendSocket = false) => {
  if (!messages || messages?.length == 0) return [];

  const newMessParse = reverse(messages?.flatMap(mess => {
    const [messFilterMedias, messFilterOrders, messFilterProducts] = [
      mess?.attachments?.filter(item => item?.type == 'image'),
      mess?.attachments?.filter(item => item?.type == 'order' || item?.type == 'source_content_order'),
      mess?.attachments?.filter(item => item?.type == 'item' || item?.type == 'source_content_item'),
    ];

    const baseMessage = {
      position: mess?.senderType != 'user' ? 'right' : 'left',
      messId: mess?.id,
      pushErrorMessage: mess?.pushErrorMessage,
      pushStatus: mess?.pushStatus,
      sentAt: mess?.sentAt,
      dateString: dayjs.unix(mess.sentAt / 1000).format('HH:mm'),
      date: true
    }
    const isMessText = (mess?.channelCode == 'shopee' && mess?.senderType == 'user')
      ? !!mess?.text
      : mess?.attachments?.length == 0;

    const messOrders = messFilterOrders?.map(attachment => {
      return {
        id: attachment.id,
        type: 'order',
        data: messFilterOrders?.map(order => {
          const orderValue = !!order?.value ? JSON.parse(order?.value) : null;
          return {
            info: orderValue
          }
        }),
        ...baseMessage
      }
    });

    const messProducts = messFilterProducts?.length > 0 ? [{
      id: messFilterProducts?.[0]?.id,
      type: 'item',
      data: messFilterProducts?.map(product => {
        const productValue = !!product?.value ? JSON.parse(product?.value) : null;
        return {
          info: productValue
        }
      }),
      ...baseMessage
    }] : [];

    const messMedias = messFilterMedias?.length > 0 ? [{
      id: messFilterMedias?.[0]?.id,
      type: 'photo',
      data: messFilterMedias?.map(media => ({
        width: 200,
        height: 100,
        uri: !!media?.value ? JSON.parse(media?.value)?.url : ""
      })),
      ...baseMessage
    }] : [];

    const messText = isMessText ? [{
      id: mess?.id,
      type: 'text',
      text: mess?.text,
      ...baseMessage,
    }] : []

    return [...messOrders, ...messProducts, ...messMedias, ...messText]
  }));

  if (isAppendSocket) return newMessParse;

  // Group mess by day
  const messGroupByDay = groupBy(newMessParse?.map(mess => {
    const formattedDate = moment.unix(mess?.sentAt / 1000).format('dddd DD/MM/YYYY');

    return {
      ...mess,
      day: formattedDate
    }
  }), 'day');

  // Sort group mess by day
  const sortMessGroupBy = sortBy(Object.keys(messGroupByDay).map(key => {
    const keyTime = key.split(' ')?.[key.split(' ')?.length - 1].split('/');
    const timestampByDay = dayjs(keyTime.reverse().join('-')).unix();

    return {
      timestampByDay,
      day: key
    }
  }), 'timestampByDay')

  // Show final mess: add user for mess pass condition first position per day
  const messagesView = sortMessGroupBy.flatMap(sortMess => {
    let timeString;
    const startOfDay = dayjs().startOf('day').unix();
    const startOfYesterday = dayjs().subtract(1, 'day').startOf('day').unix();
    const startOfWeek = dayjs().subtract(7, 'day').startOf('day').unix();

    if (sortMess?.timestampByDay + 60 > startOfDay) {
      timeString = 'Hôm nay'
    } else if (sortMess?.timestampByDay + 60 > startOfYesterday) {
      timeString = 'Hôm qua'
    } else if (sortMess?.timestampByDay + 60 > startOfWeek) {
      timeString = sortMess?.day
    } else {
      timeString = dayjs.unix(sortMess?.timestampByDay).format('DD/MM/YYYY');
    }

    const arrTypeSystem = [{
      type: 'system',
      text: timeString
    }];

    const arrTypeDifference = messGroupByDay[sortMess?.day].map((item, index) => {
      const findItem = index == 0 || messGroupByDay[sortMess?.day][index - 1]?.position != item?.position;

      if (findItem) {
        return {
          ...item,
          ...(item?.position == 'left' ? {
            customer: currentConversation?.customer
          } : {
            user: user
          })
        }
      }
      return item
    })

    return [...arrTypeSystem, ...arrTypeDifference]
  });

  return messagesView
}
