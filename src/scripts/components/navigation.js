import page  from 'page';
import React from 'react';

import Action          from '../actions';
import UserAction      from '../actions/user';
import SettingsAction from '../actions/settings';
import BroadcastAction from '../actions/broadcast';

import Dropdown  from '../components/dropdown';
import UserVoice from '../components/user-voice';
import InfoView  from './dialog/view-info';
import ReviewView  from './dialog/review-view';
import AboutView from './dialog/view-about';

/**
 *
 */
export default React.createClass({
	propTypes: {
		title: React.PropTypes.string.isRequired,
		showHelp: React.PropTypes.bool
	},

	getInitialState() {
		return {
			dropdown: false, localesDropdown: false,
			feedback: false, infoActive: false,
			aboutActive: false, reviewActive: false,
		}
	},

	showWorkspace() {
		return page.show('/boards');
	},

	toggleDropdown() {
		this.setState({ dropdown: !this.state.dropdown });
		if(this.state.localesDropdown)
			this.setState({ localesDropdown: !this.state.localesDropdown });
	},

	toggleInfoView() {
		this.setState({ infoActive: !this.state.infoActive });
	},

	toggleReview() {
		this.setState({ reviewActive: !this.state.reviewActive });
	},

	toggleAboutView() {
		this.setState({ aboutActive: !this.state.aboutActive });
	},

	render: function() {

		let infoDialog = null;
		let reviewDialog = null;
		let aboutDialog = null;
		let activeClick = null;
		let infoIcon = null;

		if(!this.state.infoActive) {
			infoIcon = 'info';
			infoDialog = null;
		} else {
			infoIcon = 'times';
			infoDialog = <InfoView onDismiss = { this.toggleInfoView } />;
		}

		if(!this.state.reviewActive) {
			reviewDialog = null;
		} else {
			reviewDialog = <ReviewView tickets = {this.props.tickets}
			onDismiss = { this.toggleReview } />;
		}


		if(!this.state.aboutActive) {
			aboutDialog = null;
		} else {
			aboutDialog = <AboutView onDismiss = { this.toggleAboutView } />;
		}

		let infoButtonClass =
			React.addons.classSet({
				infobutton: true,
				pulsate: localStorage.getItem('infovisited') === null
					? true : false,
				active: this.state.infoActive
			});

		let reviewButtonClass =
			React.addons.classSet({
				infobutton: true,
				active: this.state.reviewActive
			});

		let userButtonClass =
			React.addons.classSet({
				avatar: true,
				active: this.state.dropdown
			});

		let showInfo = !this.props.showHelp ? null : (
			<div id="info" onClick={this.toggleInfoView} className={infoButtonClass}>
				<span className={`fa fa-fw fa-${infoIcon}`}></span>
			</div>
			);


		let items = [
			{ icon: 'user', content: 'Profile',
			onClick: () => {
				return page.show('/profile')
			}
			},
			{ icon: 'language', content: 'Localization',
				onClick: () => {
					this.setState({ localesDropdown: !this.state.localesDropdown });
				}
			},
			{
				content: (
					<UserVoice>
						<span className="fa fa-fw fa-bullhorn" />
						Feedback
					</UserVoice>
				)
			},
			{
				onClick: () => {
					this.toggleAboutView();
				},
				icon: 'question-circle', content: 'About'
			},
			{
				onClick: () => {
					UserAction.logout()
						.catch((err) => {
							BroadcastAction.add(err, Action.User.Logout);
						});
				},
				icon: 'sign-out', content: 'Logout'
			}
		];
		let locales = [
			{flag: 'fi', content: 'Suomi', onClick: () => {
					SettingsAction.setSetting('locale', 'fi');
					this.toggleDropdown();
				}
			},
			{flag: 'se', content: 'Svenska', onClick: () => {
					SettingsAction.setSetting('locale', 'se');
					this.toggleDropdown();
				}
			},
			{flag: 'ru', content: 'русский', onClick: () => {
					SettingsAction.setSetting('locale', 'ru');
					this.toggleDropdown();
				}
			},
			{flag: 'gb', content: 'English', onClick: () => {
					SettingsAction.setSetting('locale', 'en');
					this.toggleDropdown();
				}
			}
		]
		return (
			<nav id="nav" className="nav">
				<img className="logo" src="/dist/assets/img/logo.svg"
					onClick={this.showWorkspace} />
				<h1 className="title">{this.props.title}</h1>
				{showInfo}
				<div id="avatar" onClick={this.toggleDropdown} className={userButtonClass}>
					<span className="fa fa-fw fa-user"></span>
				</div>
				<div id="review" onClick={this.toggleReview} className={reviewButtonClass}>
					<span className="fa fa-fw fa-eye"></span>
				</div>
				<Dropdown className='options' show={this.state.dropdown} items={items} />
				<Dropdown className='locales' show={this.state.localesDropdown} items={locales} />
				{reviewDialog}
				{infoDialog}
				{aboutDialog}
			</nav>
		);
	}
});
