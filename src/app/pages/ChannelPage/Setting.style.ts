import React from 'react';
import styled from 'styled-components';

export default styled.div`    
    margin: auto;   
    height: calc(100vh - 64px);
    position: relative;        

    .card {        
      width: 95vw;      
      margin: auto; 
      margin-top: 20px;            
    }    

    .btn-create {
      min-width: 120px;
      height: 35px;
    }

    .setting-table {
      margin-top: 20px;
    }
`;

const ChannelAddRedirectWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;  
  height: calc(100vh - 64px);
`;

export { ChannelAddRedirectWrapper }