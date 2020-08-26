import React, { Component } from 'react';
import { geolocated } from 'react-geolocated';
import Autosuggest from 'react-autosuggest';
import MyContext from './ContextApi/ContextApi';

const NodeGeocoder = require('node-geocoder');
const openGeocoder = require('node-open-geocoder');

const geoOptions = {
	provider: 'google',

	// Optional depending on the providers
	httpAdapter: 'https', // Default
	apiKey: 'AIzaSyARfZUHnQfQg6rYn-G6ozM49vv6p_1mofk', // for Mapquest, OpenCage, Google Premier
	formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(geoOptions);

function Switch({ isOn, handleToggle, tab }) {
	return (
		<React.Fragment>
			<input
				checked={isOn}
				onChange={handleToggle}
				className="react-switch-checkbox"
				id={`react-switch-new-${tab}`}
				type="checkbox"
			/>

			<label
				style={{ background: isOn && '#739A35' }}
				className="react-switch-label"
				htmlFor={`react-switch-new-${tab}`}
			>
				<span className={`react-switch-button`} />
				{isOn ? <small style={{ marginLeft: 7 }}>ON</small> : <small style={{ marginLeft: 33 }}>OFF</small>}
			</label>
		</React.Fragment>
	);
}

class GeoLocator extends Component {
	constructor(props) {
		super(props);
		this.timeout = 0;
	}

	static contextType = MyContext;

	state = {
		location: false,
		locationInfo: '',
		locationInfoCoords: {},
		value: '',
		suggestions: [],
		locationList: []
	};

	componentDidMount() {
		this.showLocation();
	}

	// Show current location
	showLocation = () => {
		if (this.props.coords === null) {
			return this.setState({
				locationInfo: 'Unable to get current location'
			});
		}

		if (this.state.location && this.props.coords !== null)
			geocoder
				.reverse({
					lat: this.props.coords.latitude,
					lon: this.props.coords.longitude
				})
				.then((res) => {
					this.context.setLocationCoords(res[0].latitude, res[0].longitude);
					// this.props.setFormData();
					this.setState({
						locationInfo: `${res[0].city}, ${res[0].country}`
					});
				})
				.catch((err) => {
					console.log(err);
					this.setState({
						locationInfo: 'Unable to get current location'
					});
				});
	};

	/**
	 * Fetching suggestions based on input value
	 * @param {string} value 
	 */

	getSuggestions = (value) => {
		const inputValue = value.trim().toLowerCase();
		const inputLength = inputValue.length;

		return inputLength === 0
			? []
			: this.state.locationList.filter((loc) => loc.name.toLowerCase().slice(0, inputLength) === inputValue);
	};

	/**
	 * 
	 * @param {Object} suggestion 
	 */

	getSuggestionValue = (suggestion) => suggestion.name;

	// Render suggestions
	renderSuggestion = (suggestion) => <div>{suggestion.name}</div>;

	onChange = (event, { newValue }) => {
		this.setState({
			value: newValue
		});

		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			// Getting locations based on input
			openGeocoder().geocode(this.state.value).end((err, res) => {
				const updatedLocations = [];
				for (let r of res) {
					updatedLocations.push({
						place_id: r.place_id,
						lat: r.lat,
						lon: r.lon,
						name: `${r.address.city !== '' ? r.address.city + ',' : ''} ${r.address.suburb
							? r.address.suburb + ','
							: ''} ${r.address.country}`
					});
				}

				if (updatedLocations.length)
					this.context.setLocationCoords(
						updatedLocations[0].lat,
						updatedLocations[0].lon,
						updatedLocations[0].name
					);
				this.setState({ locationList: updatedLocations });
			});
		}, 1000);
	};

	// Autosuggest will call this function every time you need to update suggestions
	onSuggestionsFetchRequested = ({ value }) => {
		this.setState({
			suggestions: this.getSuggestions(value)
		});
	};

	// Autosuggest will call this function every time you need to clear suggestions
	onSuggestionsClearRequested = () => {
		this.setState({
			suggestions: []
		});
	};

	render() {
		// locationInfo for current location and value for selected location
		const { value, suggestions, locationList } = this.state;

		// Autosuggest will pass through all these props to the input
		const inputProps = {
			placeholder: 'Type a location',
			value,
			onChange: this.onChange
		};

		return (
			<div>
				<div
					style={{
						background: '#fff',
						padding: 5,
						display: 'flex',
						justifyContent: 'space-between',
						border: '1px solid #dee2e6',
						height: 43
					}}
				>
					<span>
						{/* <FontAwesomeIcon icon={faMapMarkerAlt} /> */}
						 {this.state.locationInfo}
					</span>
					<Switch
						tab={this.props.tab}
						isOn={this.state.location}
						handleToggle={() => {
							this.setState(
								(prevState) => ({
									location: !prevState.location
								}),
								() => {
									if (this.state.location) this.showLocation();
								}
							);
						}}
					/>
				</div>
				{!this.state.location && (
					<div>
						<Autosuggest
							suggestions={locationList}
							onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
							onSuggestionsClearRequested={this.onSuggestionsClearRequested}
							getSuggestionValue={this.getSuggestionValue}
							renderSuggestion={this.renderSuggestion}
							inputProps={inputProps}
						/>
					</div>
				)}
			</div>
		);
	}
}

export default geolocated({
	positionOptions: {
		enableHighAccuracy: false
	},
	userDecisionTimeout: 5000
})(GeoLocator);
