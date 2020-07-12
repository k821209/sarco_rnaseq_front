import React from 'react';
import {
    Segment,
    Container,
    Header,
} from 'semantic-ui-react';
function headerTop() {
    return (
        <Container>
            <Segment textAlign="center">
                <Header
                    as="h1"
                    content='Gene Expression Database of Sarcopenia'
                    color='yellow'
                    style={{
                        fontSize: '3em',
                        fontWeight: '900',
                        marginBottom: '0.2em',
                        marginTop: '0.2em',
                    }}
                />
            </Segment>
        </Container>)

}
export default headerTop;