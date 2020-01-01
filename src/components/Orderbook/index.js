import React, { Component } from 'react'
import { connect } from 'react-redux'
import { debounce } from 'lodash';

import './Orderbook.css'
import { connectToSocket } from './actions'

class Orderbook extends Component {
  constructor(props) {
    super(props)

    this.midpointRef = React.createRef()
    this.renderOrdersContainer = debounce(this.renderOrdersContainer, 100, { leading: true, maxWait: 100 })

    this.state = {
      hasScrolled: false,
      bookType:0,
      selectedStrokeColor: '#0090BC',
      strokeColor: '#717782'
    }
  }

  componentDidMount() {
    this.props.connectToSocket()
  }

  componentWillReceiveProps(props) {
    if(!this.state.hasScrolled) {
      if (this.props.asks.length > 0 && this.props.bids.length > 0) {
        if(this.midpointRef.current) {
          this.midpointRef.current.scrollIntoView({block: 'center'})
          this.setState({ hasScrolled: true })
        }
      }
    }
  }

  renderOrders(orders, extraClass) {
    const getPercentage = ({maxCumulative, cumulative}) =>{
      let fillPercentage = (maxCumulative ? cumulative / maxCumulative : 0) * 100;
      fillPercentage = Math.min(fillPercentage, 100); // Percentage can't be greater than 100%
      fillPercentage = Math.max(fillPercentage, 0); // Percentage can't be smaller than 0%
      return fillPercentage;
    }
    return (
      <div>
        {orders.map((order, index) => (
          <div className="Orderbook__book__item" key={index}>
            <div className="columns">
              <div className="column">
              <span className="price">{parseFloat(order['limit_price']).toFixed(1)}</span>
              </div>
              <div className="column">
                {parseFloat(order['size'])}
              </div>
              <div className={`column ${extraClass}`} style={{backgroundSize: getPercentage(order) + "% 100%"}}> 
                {parseFloat(order['cumulative'])}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  renderOrdersMidpoint() {
    return (
      <div id="midpointPrice" ref={this.midpointRef} className="Orderbook__book__item">
        <div className="columns">
          <div className="column">
            Midpoint Price:
          </div>
          <div className="column">
            <span className="price">{'-'}</span> <span className="percentage">{'-'}</span>
          </div>
        </div>
      </div>
    )
  }

  renderOrdersContainer(order) {
    const {bookType} = this.state
    const {asks, bids} = this.props

    function sumQuantities(orders) {
      return orders.reduce((total, order) => total + order.size, 0);
    }

    let totalAsks = sumQuantities(asks);
    let totalBids = sumQuantities(bids);
    let maxCumulative = Math.max(totalAsks, totalBids);

    let deepCopyArrayOfObj = (arr => arr.map(order => Object.assign({}, order)));

    // Deep copy and sort orders
    let askOrders = deepCopyArrayOfObj(asks).sort((a, b) => a.limit_price > b.limit_price); // ascending order
    let bidOrders = deepCopyArrayOfObj(bids).sort((a, b) => a.limit_price < b.limit_price); // descending order
    
    const calculateCumulatives = (orders) => {
      let cumulative = 0;
      return orders.map(order =>  ({...order,
        cumulative : (cumulative += order.size),
        maxCumulative : maxCumulative
      }))
    }
    let convertedAskOrders = calculateCumulatives(askOrders) 
    let convertedBidOrders = calculateCumulatives(bidOrders) 

    if (this.props.hasErrored) {
      return <div className="error--">Sorry! There was an error loading the items</div>
    }

    if (!this.props.hasFetched || this.props.isLoading) {
      return <div className="loading--">Loading…</div>
    }
    return (
      <div>
        {(bookType ===1 || bookType===0) && <div className="asks">
          {this.renderOrders(convertedAskOrders.reverse(), 'fill-ask')}
        </div>}
        {this.renderOrdersMidpoint()}
        {(bookType ===2 || bookType ===0) && <div className="bids">
            {this.renderOrders(convertedBidOrders,'fill-bid')}
          </div>}
      </div>
    )
  }

  render() {
    const { selectedStrokeColor, strokeColor, bookType} = this.state;
    return (
      <div className="Orderbook">
        <header className="Orderbook__header">
          <div className="Orderbook__header__top">
            <span className="heading">BTC (USD)</span>
          </div>
        </header>
        <div className="Orderbook__book">
          <div className="Orderbook__book__header">
            <span className="heading">Order Book</span>
          </div>
          <div className='button-div'>
               <span className="book-icon" onClick={()=>this.setState({bookType: 0})}>
                  <svg width="18px" height="18px" viewBox="0 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg"
                       xlink="http://www.w3.org/1999/xlink">
                     <desc>Created with Sketch.</desc>
                     <defs></defs>
                     <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g id="Second-Header" transform="translate(-855.000000, -134.000000)" fill-rule="nonzero">
                           <g id="Group-4" transform="translate(856.000000, 135.000000)">
                              <rect id="Rectangle-10" stroke={bookType === 0 ? selectedStrokeColor: strokeColor} x="0" y="0" width="16" height="16"></rect>
                              <rect id="Rectangle-2" fill="#D75750" x="2" y="3" width="12" height="1"></rect>
                              <rect id="Rectangle-2-Copy" fill="#D75750" x="2" y="6" width="12" height="1"></rect>
                              <rect id="Rectangle-2-Copy-3" fill="#55B987" x="2" y="9" width="12" height="1"></rect>
                              <rect id="Rectangle-2-Copy-4" fill="#55B987" x="2" y="12" width="12" height="1"></rect>
                           </g>
                        </g>
                     </g>
                  </svg>
               </span>
              <span className="book-icon" onClick={()=>this.setState({bookType: 2})}>
                  <svg width="18px" height="18px" viewBox="0 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg"
                       xlink="http://www.w3.org/1999/xlink">
                     <desc>Created with Sketch.</desc>
                     <defs></defs>
                     <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g id="Second-Header" transform="translate(-885.000000, -134.000000)" fill-rule="nonzero">
                           <g id="Group-4-Copy" transform="translate(886.000000, 135.000000)">
                              <rect id="Rectangle-10" stroke={bookType === 2 ? selectedStrokeColor: strokeColor} x="0" y="0" width="16" height="16"></rect>
                              <rect id="Rectangle-2" fill="#55B987" x="2" y="3" width="12" height="1"></rect>
                              <rect id="Rectangle-2-Copy" fill="#55B987" x="2" y="6" width="12" height="1"></rect>
                              <rect id="Rectangle-2-Copy-3" fill="#55B987" x="2" y="9" width="12" height="1"></rect>
                              <rect id="Rectangle-2-Copy-4" fill="#55B987" x="2" y="12" width="12" height="1"></rect>
                           </g>
                        </g>
                     </g>
                  </svg>
               </span>
               <span className="book-icon" onClick={()=>this.setState({bookType: 1})}>
                  <svg width="18px" height="18px" viewBox="0 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg"
                       xlink="http://www.w3.org/1999/xlink">
                     <desc>Created with Sketch.</desc>
                     <defs></defs>
                     <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g id="Second-Header" transform="translate(-915.000000, -134.000000)" fill-rule="nonzero">
                           <g id="Group-4-Copy-2" transform="translate(916.000000, 135.000000)">
                              <rect id="Rectangle-10" stroke={bookType === 1 ? selectedStrokeColor: strokeColor} x="0" y="0" width="16" height="16"></rect>
                              <rect id="Rectangle-2" fill="#D75750" x="2" y="3" width="12" height="1"></rect>
                              <rect id="Rectangle-2-Copy" fill="#D75750" x="2" y="6" width="12" height="1"></rect>
                              <rect id="Rectangle-2-Copy-3" fill="#D75750" x="2" y="9" width="12" height="1"></rect>
                              <rect id="Rectangle-2-Copy-4" fill="#D75750" x="2" y="12" width="12" height="1"></rect>
                           </g>
                        </g>
                     </g>
                  </svg>
               </span>
          </div>

          <div className="Orderbook__book__subheader">
            <div className="columns">

              <div className="column">
                <span className="heading">Price (USD)</span>
              </div>
              <div className="column">
                <span className="heading">Size</span>
              </div>
              <div className="column">
                <span className="heading">Total</span>
              </div>
            </div>
          </div>
          <div className="Orderbook__book__content">
            <div className="Orderbook__book__content-inner">
              {this.renderOrdersContainer()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isLoading: state.orderbook.isLoading,
    hasErrored: state.orderbook.hasErrored,
    hasFetched: state.orderbook.hasFetched,
    asks: state.orderbook.asks,
    bids: state.orderbook.bids
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    connectToSocket: () => dispatch(connectToSocket())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Orderbook)
