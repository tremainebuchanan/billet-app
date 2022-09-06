const buildAptTime = () => {
    return [
      "8:00 A.M.",
      '8:30 A.M.',
      '9:00 A.M.',
      '9:30 A.M.',
      '10:00 A.M.',
      '10:30 A.M.',
      '11:00 A.M.',
      '11:30 A.M.',
      '12:00 P.M.',
      '12:30 P.M.',
      '1:00 P.M.',
      '1:30 P.M.',
      '2:00 P.M.',
      '2:30 P.M.',
      '3:00 P.M.',
      '3:30 P.M.',
      '4:00 P.M.',
      '4:30 P.M.',
      '5:00 P.M.'
  ];
  }
  
  const getServiceList = () => {
    return [
      {id: 6, title: "Crown"},
      {id: 7, title: "Crown and Bridge"},
      {id: 1, title: "Dental Examination/Dental Report"},
      {id: 8, title: "Denture"},
      {id: 9, title: "Extraction"},
      {id: 4, title: "Filing"},
      {id: 2, title: "Flouride treatment"},
      {id: 5, title: "Root Canal"},
      {id: 10, title: "Teeth Whitening"},
      {id: 3, title: "X-ray"},
      {id: 11, title: "Other"}
    ];
  }

  module.exports = { getServiceList, buildAptTime }