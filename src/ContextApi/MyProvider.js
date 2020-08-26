import React from 'react';
import MyContext from './ContextApi';

export default class MyProvider extends React.Component {
	state = {
		locationInfoCoords: {
			lat: '',
			lng: '',
			city: ''
		}
	};

	/**
     * Function to receive lat and lng of user
     * @param  lat
     * @param  lng
     * @param  city
     */

	setLocationCoords = (lat, lng, city) => {
		this.setState((prevState) => {
			return {
				...prevState,
				locationInfoCoords: {
					lat,
					lng,
					city
				}
			};
		});
	};

	render() {
		const { setLocationCoords } = this;

		return (
			<MyContext.Provider
				value={{
					...this.state,
					setLocationCoords
				}}
			>
				{this.props.children}
			</MyContext.Provider>
		);
	}
}
