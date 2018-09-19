/* API can only receive 100 calls per day in the free version otherwise error code 429 is returned */

import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import axios from 'axios';

// alternate API_KEY = EFFBB256-59A7-4C84-89BC-B2E09260A2EA
const API_KEY = "apikey=AED0CD5E-31C5-49EB-BD75-9DB97F610378";
const URL = "https://rest.coinapi.io/v1/";
const ASSETS = "assets";
const EXCHANGE = "exchangerate/"


// TODO: load all together at first
// TODO: add style

// uppercase the first letter and lowercase the rest
function toTitleCase(str) {
  let arr = str.split(' ');
  let newStr = '';
  arr.forEach((item) => {

    let word = '';
    try {
      word = item[0].toUpperCase();
    } catch(e) {
      console.log(e);
    }

    for (let i = 1; i < item.length; i++) {
      word += item[i].toLowerCase();
    }
    if (arr.length === 1 || arr[arr.length -1] === item) {
      newStr += word;
    } else {
        newStr += `${word} 333`;
    }
  });
  return newStr;
}

//console.log(toTitleCase('hello '));

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null,
      searchTerm: '',
      currency: 'USD',
      price: 0
    }
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.setResult = this.setResult.bind(this)
    this.switchCurrency = this.switchCurrency.bind(this);
  }

  setResult(token, price) {

    if (token instanceof Array) {
      this.setState({
        result: token[0],
        price
      })
    } else {
      this.setState({
        result:token,
        price
      })
    }
    console.log(`You searched for ${token[0].name}, symbol: ${token[0].asset_id} and the price is $${price} ${this.state.currency}`);
  }

  // switch between usd and cad
  switchCurrency(currency) {
    const {result} = this.state;
    // fetchPrice is a callback because setState is asynchronous
    if (result) {
      this.setState({
        currency
      }, () => {
        this.fetchPrice(result, result.asset_id);
      });
    }
  }

  // fetches the price of the given cryptocurrency
  fetchPrice(token, asset_id) {

    const {currency} = this.state;
    console.log(this.state)
    //BTC/USD?apikey=EFFBB256-59A7-4C84-89BC-B2E09260A2EA";
    axios(`${URL}${EXCHANGE}${asset_id}/${currency}?${API_KEY}`)

      .then((result) => {
        this.setResult(token, result.data.rate);
      })
      .catch(error => console.log(error));
  }

  // looks up a given cryptocurrency
  fetchData(searchedTerm) {
    let titleCaseSearch = toTitleCase(searchedTerm);
    axios(`${URL}${ASSETS}?${API_KEY}`)
      .then((result) => {
        // TODO: seperate out
        const isCrypto = item =>  item.name === titleCaseSearch || item.asset_id === searchedTerm.toUpperCase();

        let token = result.data.filter(isCrypto);
        this.fetchPrice(token, token[0].asset_id);

      })
      .catch(error => console.log(error));
  }

  // event has the value of the input field as its target object - this sets state to the value searched
  onSearchChange (event) {
    this.setState({
      searchTerm: event.target.value
    });
  }


  onSearchSubmit(event) {
    event.preventDefault();
    const {searchTerm} = this.state;
    this.fetchData(searchTerm);
  }



  render() {
    const {
      searchTerm,
      result,
      price,
      currency
    } = this.state;

    return (
      <div className="App">
       <h1>Welcome to Crypto Tokens Quick Quotes </h1>
        <p className="App-intro">
          To get started you can look up any cryptocurrency by their name or by their symbol
        </p>

        <Search
          value = {searchTerm}
          onChange = {this.onSearchChange}
          onSubmit = {this.onSearchSubmit}
        />

        <div className="interactions">
          <Button
            onClick = { () =>
              this.switchCurrency('USD')
            }
          >
            USD
          </Button>
          <Button
            onClick = { () =>
              this.switchCurrency('CAD')
            }
          >
            CAD
          </Button>
          {result ?
            <Table
              result={result}
              price={price}
              currency={currency}
            /> : <p>Please enter a cryptocurrency</p>
        }

        </div>
      </div>
    );
  }
}

class Search extends Component {
  render() {

    const {
      value,
      onChange,
      onSubmit
    } = this.props;

    return (
      <div>
        <form onSubmit={onSubmit}>
          <input
            autoFocus={true}
            className="search-input"
            type="text"
            placeholder="Search"
            value={value}
            onChange={onChange}

          />
        </form>
      </div>
    );
  }
}

const Table = ({result, price, currency}) =>
  <div className="table-row">
    <span style={{ width: '40%' }}>
      <p>{result.name} | {result.asset_id}: {price} {currency}</p>
    </span>


  </div>

const Button = ({onClick, children}) =>
  <button
    type="button"
    onClick={onClick}
  >
    {children}
  </button>


export default App;
