import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import './App.css';

interface User {
	id: number;
	name: string;
	avatar: string;
}

function App() {
	const [tweet, setTweet] = useState<string>('');
	const [users, setUsers] = useState<User[]>([])
	const [suggestions, setSuggestions] = useState<User[]>([]);
	const [showMentions, setShowMentions] = useState<boolean>(false);
	
	const inputRef = useRef<HTMLTextAreaElement>(null);
	
	const escapeRegex = (str: string) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
	
	const makeTriggerRegex = () => {
		const trigger = escapeRegex('@');
		
		return new RegExp(`(?:^|\\s)(${trigger}([^\\s${trigger}]*))$`)
	}
	
	const regExp = new RegExp('@', 'ig');
	
	useEffect(() => {
		const getUsers = async () => {
			const resp = await fetch('https://reqres.in/api/users', {
				method: 'GET'
			});
			const response = await resp.json();
			
			const formattedResponse = response.data.map((res: any) => {
				const user = {
					id: res.id,
					name: `${res.first_name} ${res.last_name}`,
					avatar: res.avatar
				};
				
				return user;
			})
			
			console.log(formattedResponse)
			setUsers(formattedResponse);
		}
		
		getUsers();
	}, [])
	
	const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.currentTarget.value;
		let matches: User[] = [];
		
		if (value.length > 0) {
			const regex = makeTriggerRegex();
			const match = value.match(regex)
			if (match) {
				const newValue = match[1].replace('@', '').trim();
				
				matches = users.filter((user) => {
					const regExp = new RegExp(`${newValue}`, 'gi');
					return user.name.match(regExp);
				})
				
				if (matches) {
					setSuggestions(matches);
				}
				
				if (suggestions) {
					setShowMentions(true)
				}
			} else {
				setShowMentions(false)
			}
		}
		
		setTweet(value);
	}
	
	const onSuggestionSelect = (value: string) => {
		inputRef.current.focus();
		setTweet((curVal) => curVal + value);
		
		setShowMentions(false)
	}
	
	return (
		<div className="App">
			<header className="App-header">
				<div className="container">
					<textarea
						ref={inputRef}
						style={{ height: 100, width: 400 }}
						value={tweet}
						onChange={handleInputChange}
						placeholder="Mention users"
					/>
					<div className="suggestion-container">
						{tweet && suggestions && showMentions && suggestions.map((suggestion, i) => (
							<div className="suggestion-item" onClick={() => onSuggestionSelect(suggestion.name)}>
								<img src={suggestion.avatar}/>
								<p>{suggestion.name}</p>
							</div>
						))}
					</div>
				</div>
			</header>
		</div>
	);
}

export default App;
