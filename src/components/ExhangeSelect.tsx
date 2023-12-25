import React, { useEffect, useState } from 'react'
import style from '../styles/ExchangeSelect.module.scss'
import swapImg from '../img/swap.svg'
import swapImgLowScreen from '../img/swap_low_screen.svg'
import axios from 'axios'
import useScreenSize from '../customHooks/useScreenResize'
import Select from 'react-select'

export const ExhangeSelect = () => {
    const screenSize = useScreenSize()

    const [firstCurrency, setFirstCurrency] = useState<string[]>([])
    const [secondCurrency, setSecondCurrency] = useState<string[]>([])

    const [loading, setLoading] = useState<boolean>(true)

    //ERRORS
    const [pairIsInactiveError, setPairIsInactiveError] =
        useState<boolean>(false)
    const [maxAmountExceededError, setMaxAmountExceededError] =
        useState<boolean>(false)
    const [minAmountError, setMinAmountError] = useState<boolean>(false)
    /////////////////////

    const [firstChosenCurrency, setFirstChosenCurrency] =
        useState<string>('btc')
    const [secondChosenCurrency, setSecondChosenCurrency] =
        useState<string>('eth')

    const [leftAmount, setLeftAmount] = useState<string | number>('')

    const [minimalAmountOfLeftCurrency, setMinimalAmountOfLeftCurrency] =
        useState<string>('')
    const [estimatedAmountRightCurrency, setEstimatedAmountRightCurrency] =
        useState<string | number>('')

    // UseEffect with Fetch List of available currencies and fetch min amount when start app for the first time
    useEffect(() => {
        axios
            .get('https://api.changenow.io/v1/currencies?active=true')
            .then(response => {
                setFirstCurrency(response.data)
                setSecondCurrency(response.data)
                setLoading(false)
            })
            .catch(error => {
                console.log(error.response)
            })
        axios
            .get(
                `https://api.changenow.io/v1/min-amount/btc_btc?api_key=${process.env.REACT_APP_API_KEY}`
            )
            .then(response => {
                setMinimalAmountOfLeftCurrency(response.data.minAmount)
            })
            .catch(error => {
                console.log(error.response)
            })
    }, [])
    //////////////////////////////////////

    //UseEffect with fetch minimal exchange amount every time when currency changed
    useEffect(() => {
        axios
            .get(
                `https://api.changenow.io/v1/min-amount/${firstChosenCurrency}_${secondChosenCurrency}?api_key=${process.env.REACT_APP_API_KEY}`
            )
            .then(response => {
                setMinimalAmountOfLeftCurrency(response.data.minAmount)
            })
            .catch(error => {
                if (error.response.data.error === 'pair_is_inactive') {
                    setPairIsInactiveError(true)
                    console.log(error.response)
                }
            })
    }, [firstChosenCurrency, secondChosenCurrency])
    //////////////////////////////////////////////////////

    // UseEffect with fetch estimated amount
    useEffect(() => {
        axios
            .get(
                `https://api.changenow.io/v1/exchange-amount/${leftAmount}/${firstChosenCurrency}_${secondChosenCurrency}?api_key=${process.env.REACT_APP_API_KEY}`
            )
            .then(response => {
                setEstimatedAmountRightCurrency(response.data.estimatedAmount)
                setMinAmountError(false)
            })
            .catch(error => {
                if (error.response.data.error === 'pair_is_inactive') {
                    setPairIsInactiveError(true)
                    console.log(error.response)
                }

                if (error.response.data.error === 'max_amount_exceeded') {
                    setMaxAmountExceededError(true)
                    console.log(error.response)
                } else {
                    setMaxAmountExceededError(false)
                }

                if (leftAmount < minimalAmountOfLeftCurrency) {
                    setMinAmountError(true)
                    setEstimatedAmountRightCurrency('-')
                } else {
                    setMinAmountError(false)
                }

                if (leftAmount === '') {
                    setEstimatedAmountRightCurrency('')
                    setMinAmountError(false)
                }
            })
    }, [
        leftAmount,
        firstChosenCurrency,
        secondChosenCurrency,
        minimalAmountOfLeftCurrency,
    ])
    //////////////////////////////////////

    if (loading) return <p>Loading...</p>

    interface ICurrencyList {
        label: string
        value: string | number
    }

    const changeFirstCurrency = (e: ICurrencyList | null) => {
        if (e !== null) {
            setFirstChosenCurrency(e.label)
            setPairIsInactiveError(false)
        }
    }

    const changeSecondCurrency = (e: ICurrencyList | null) => {
        if (e !== null) {
            setSecondChosenCurrency(e.label)

            setPairIsInactiveError(false)
        }
    }

    const changeLeftAmountHandler = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTimeout(() => {
            setLeftAmount(e.target.value)
        }, 500)
    }

    const swapCurrencies = () => {
        setPairIsInactiveError(false)
        setFirstChosenCurrency(secondChosenCurrency)
        setSecondChosenCurrency(firstChosenCurrency)
    }

    // Search field styles
    const colourStyles = {
        control: (styles: any) => ({
            ...styles,
            backgroundColor: '#f6f7f8',
            border: '1px solid #e3ebef',
            height: '50px',
            borderRadius: '0px 5px 5px 0',
        }),
        option: (styles: any, { isDisabled, isFocused }: any) => {
            return {
                ...styles,
                backgroundColor: isFocused ? '#EAF1F7' : 'white',
                color: 'black',
                cursor: isDisabled ? '#EAF1F7' : '#EAF1F7',
            }
        },
    }
    ////////////////////////////////

    return (
        <>
            <div className={style.selectFlex}>
                <div className={style.bigInputAndSelect}>
                    <input
                        type='number'
                        min='0'
                        inputMode='tel'
                        name='value'
                        placeholder={minimalAmountOfLeftCurrency}
                        onChange={changeLeftAmountHandler}
                    />
                    {minAmountError ? (
                        <p>The entered amount is less than the minimum</p>
                    ) : (
                        ''
                    )}
                    {maxAmountExceededError ? (
                        <p>The maximum amount exceeded</p>
                    ) : (
                        ''
                    )}

                    <Select
                        className={style.select}
                        options={firstCurrency.map((data: any) => ({
                            label: data.ticker,
                            value: data.name,
                        }))}
                        onChange={changeFirstCurrency}
                        noOptionsMessage={() => 'currency not found'}
                        styles={colourStyles}
                        defaultValue={{ label: 'btc', value: 0 }}
                        value={{
                            label: firstChosenCurrency,
                            value: firstChosenCurrency,
                        }}
                        components={{
                            IndicatorSeparator: () => null,
                        }}
                    />
                </div>

                <button
                    onClick={() => swapCurrencies()}
                    className={style.swapButton}
                >
                    <img
                        src={screenSize ? swapImgLowScreen : swapImg}
                        alt=''
                        className={style.swapImg}
                    />
                </button>

                <div className={style.bigInputAndSelect}>
                    <input
                        type='text'
                        name='esimatedAmount'
                        readOnly
                        value={estimatedAmountRightCurrency}
                    />
                    <Select
                        className={style.select}
                        options={secondCurrency.map((data: any) => ({
                            label: data.ticker,
                            value: data.name,
                        }))}
                        onChange={changeSecondCurrency}
                        noOptionsMessage={() => 'currency not found'}
                        styles={colourStyles}
                        defaultValue={{ label: 'btc', value: 0 }}
                        value={{
                            label: secondChosenCurrency,
                            value: secondChosenCurrency,
                        }}
                        components={{
                            IndicatorSeparator: () => null,
                        }}
                    />
                </div>
            </div>
            <div className={style.cryptoAddressFlex}>
                <label htmlFor='address'>Your Ethereum address</label>
                <div className={style.flexInputButton}>
                    <input type='text' id='address' name='address' />
                    <div className={style.buttonFlex}>
                        <button>Exchange</button>
                        {pairIsInactiveError ? (
                            <p>This pair is disable now</p>
                        ) : (
                            ''
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
