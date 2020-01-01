const DEFAULT = {
  hasErrored: false,
  isLoading: false,
  hasFetched: false,
  asks: [],
  bids: []
}

export default function(state = DEFAULT, action) {
  switch (action.type) {
    case 'ORDERBOOK_HAS_ERRORED':
      return {
        ...state,
        hasErrored: action.hasErrored
      }

    case 'ORDERBOOK_IS_LOADING':
      return {
        ...state,
        isLoading: action.isLoading
      }

    case 'ORDERBOOK_HAS_FETCHED':
      return {
        ...state,
        hasFetched: action.hasFetched
      }

    case 'ORDERBOOK_WS_UPDATE':
      switch (action.data.type) {
        case 'l2_orderbook':
            return {
              ...state,
              asks: [...action.data.response.buy],
              bids: [...action.data.response.sell],
            }

        default:
          return state
      }

    default:
      return state
  }
}
