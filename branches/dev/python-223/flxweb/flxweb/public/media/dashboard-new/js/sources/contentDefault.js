import routes from 'routes'

const contentDefault = {
		title:'Dashboard - Content | CK-12 Foundation',
		activeTab :"recommendedBySubjects",
		contentTabs:{
		recommendedBySubjects:{
							title:"RECOMMENDED BY SUBJECTS",
							id:"recommendedBySubjects",
							isDropDown:false,
							route:routes.contentPage.recommended
						},
        mathAndScienceStandards:{
							title:"MATH AND SCIENCE STANDARDS",
							id:"mathAndScienceStandards",
							isDropDown:true,
							route:routes.contentPage.standards
						}

					},
		recentlyViewed:[],
		lessons:[],
		videos:[],
		asmtpractice:[],
		plix:[],
		rwa:[],
		simulationint:[],
		placedInLibrary:[]
	}

export default contentDefault;