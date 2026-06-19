import { useLazyQuery, useMutation, useQuery } from "@apollo/client"
import query_smeStore from "graphql/queries/query_smeStore"
import { useCallback, useEffect, useMemo } from "react"
import { showAlert } from "utils/helper"
import { createAddAccountHandlers, getSupportedAddCodes, normalizePartnerCode } from "../addAccountHandlers"
import type { DataStoreProps } from "../dialogs/ModalAddAccount"
import query_scPartnerAuthorizationUrl from "graphql/queries/query_scPartnerAuthorizationUrl"
import query_scPartnerAccounts from "graphql/queries/query_scPartnerAccounts"
import mutate_scPartnerAuthorizationGrant from "graphql/mutations/mutate_scPartnerAuthorizationGrant"
import mutate_scDisconnectPartnerAccount from "graphql/mutations/mutate_scDisconnectPartnerAccount"
import mutate_scDeletePartnerAccount from "graphql/mutations/mutate_scDeletePartnerAccount"

const usePartnerConnect = () => {
  const { data: stores, loading: loadingDataStore } = useQuery(query_smeStore, {
    fetchPolicy: 'network-only'
  })

  const dataStore = useMemo(() => {
    return stores?.op_connector_channels ?? []
  }, [stores])


  const [authorize, { loading: loadingAuthorize }] = useLazyQuery(query_scPartnerAuthorizationUrl)
  const authorizeTiktok = useCallback(async (connector_channel_code: string) => {
    const { data } = await authorize({
      variables: {
        connector_channel_code,
      }
    })
    if (data?.scPartnerAuthorizationUrl?.authorization_url) {
      window.location.replace(data?.scPartnerAuthorizationUrl?.authorization_url)
    } else {
      showAlert.error('Có lỗi xảy ra, xin vui lòng thử lại')
    }
  }, [authorize])

  const addAccountHandlers = useMemo(
    () => createAddAccountHandlers({ authorizeTiktok }),
    [authorizeTiktok]
  )
  const supportedAddCodes = useMemo(() => getSupportedAddCodes(addAccountHandlers), [addAccountHandlers])

  const onAddAccount = useCallback((item: DataStoreProps) => {
    const code = normalizePartnerCode(item.code)
    const handler = addAccountHandlers[code]
    if (handler) {
      handler(item)
    } else {
      showAlert.error('Chưa hỗ trợ thêm kênh này')
    }
  }, [addAccountHandlers])

  const { data: partnerAccounts, loading: loadingPartnerAccounts } = useQuery(query_scPartnerAccounts)
  const dataPartnerAccounts = useMemo(() => {
    return partnerAccounts?.scPartnerAccounts ?? []
  }, [partnerAccounts])

  
  const [grantAuthorization, {data: dataGrantAuthorization, loading: loadingGrantAuthorization }] = useMutation(mutate_scPartnerAuthorizationGrant, {
    awaitRefetchQueries: true,
    refetchQueries: [query_scPartnerAccounts]
  })

  // Handler cho grant authorization
  const handleGrantAuthorization = useCallback((channel: string, params: any) => {
    grantAuthorization({
      variables: {
        connector_channel_code: channel,
        params: Object.keys(params)
          .map(key => ({ key, value: params[key] }))
      },
      awaitRefetchQueries: true,
      refetchQueries: [query_scPartnerAccounts]
    })
  }, [grantAuthorization])

  const [disconnectPartnerAccount, {data: dataDisconnectPartnerAccount, loading: loadingDisconnectPartnerAccount }] = useMutation(mutate_scDisconnectPartnerAccount, {
    awaitRefetchQueries: true,
    refetchQueries: [query_scPartnerAccounts]
  })

  const [deletePartnerAccount, {data: dataDeletePartnerAccount, loading: loadingDeletePartnerAccount }] = useMutation(mutate_scDeletePartnerAccount, {
    awaitRefetchQueries: true,
    refetchQueries: [query_scPartnerAccounts]
  })

  // Xử lý kết quả disconnect
  useEffect(() => {
    if (dataDisconnectPartnerAccount?.scDisconnectPartnerAccount) {
      const result = dataDisconnectPartnerAccount.scDisconnectPartnerAccount;
      if (result.success == 1 || result.success === true) {
        showAlert.success('Tạm dừng tài khoản thành công');
      } else {
        showAlert.error(result.message || 'Tạm dừng tài khoản thất bại');
      }
    }
  }, [dataDisconnectPartnerAccount]);

  // Xử lý kết quả delete
  useEffect(() => {
    if (dataDeletePartnerAccount?.scDeletePartnerAccount) {
      const result = dataDeletePartnerAccount.scDeletePartnerAccount;
      if (result.success == 1 || result.success === true) {
        showAlert.success('Xoá tài khoản thành công');
      } else {
        showAlert.error(result.message || 'Xoá tài khoản thất bại');
      }
    }
  }, [dataDeletePartnerAccount]);

  // Handlers
  const handleDisconnectPartnerAccount = useCallback((partner_account_id: number) => {
    disconnectPartnerAccount({
      variables: {
        partner_account_id: partner_account_id
      }
    })
  }, [disconnectPartnerAccount])

  const handleDeletePartnerAccount = useCallback((partner_account_id: number) => {
    deletePartnerAccount({
      variables: {
        partner_account_id: partner_account_id
      }
    })
  }, [deletePartnerAccount])

  // Handler cho reconnect - gọi lại API authorization URL
  const handleReconnectPartnerAccount = useCallback((connector_channel_code: string) => {
    const code = normalizePartnerCode(connector_channel_code)
    const handler = addAccountHandlers[code]
    if (handler) {
      handler({ code: connector_channel_code } as DataStoreProps)
    } else {
      showAlert.error('Chưa hỗ trợ kết nối lại kênh này')
    }
  }, [addAccountHandlers])

  return {
    dataStore,
    loadingDataStore,
    onAddAccount,
    supportedAddCodes,
    loadingAuthorize,

    dataPartnerAccounts,
    loadingPartnerAccounts,

    grantAuthorization,
    dataGrantAuthorization,
    loadingGrantAuthorization,
    handleGrantAuthorization,

    handleDisconnectPartnerAccount,
    loadingDisconnectPartnerAccount,

    handleDeletePartnerAccount,
    loadingDeletePartnerAccount,

    handleReconnectPartnerAccount,
  }
}

export default usePartnerConnect